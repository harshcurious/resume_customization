import { createOpencodeServer } from "@opencode-ai/sdk/server";

import type { OpenCodeClientConfig } from "./client.js";

export interface ManagedOpencodeServer {
  started: boolean;
  client: OpenCodeClientConfig;
  close(): void;
}

export interface EnsureOpencodeServerInput {
  client: OpenCodeClientConfig;
  healthCheck?: (client: OpenCodeClientConfig) => Promise<boolean>;
  serverFactory?: (options: { hostname: string; port: number }) => Promise<{
    url: string;
    close(): void;
  }>;
}

export async function ensureOpencodeServer(
  input: EnsureOpencodeServerInput,
): Promise<ManagedOpencodeServer> {
  const healthCheck = input.healthCheck ?? isOpencodeServerReachable;

  if (await healthCheck(input.client)) {
    return {
      started: false,
      client: input.client,
      close() {},
    };
  }

  const { hostname, port } = parseBaseUrl(input.client.baseURL);
  const startServer = input.serverFactory ?? createOpencodeServer;
  const server = await startServer({ hostname, port });

  return {
    started: true,
    client: {
      ...input.client,
      baseURL: server.url,
    },
    close() {
      server.close();
    },
  };
}

async function isOpencodeServerReachable(client: OpenCodeClientConfig): Promise<boolean> {
  const url = new URL("/session/status", client.baseURL);
  url.searchParams.set("directory", client.directory);

  try {
    const response = await fetch(url, {
      method: "GET",
    });

    return response.ok;
  } catch {
    return false;
  }
}

function parseBaseUrl(baseURL: string): { hostname: string; port: number } {
  const url = new URL(baseURL);
  const port = url.port ? Number.parseInt(url.port, 10) : defaultPortForProtocol(url.protocol);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid OpenCode server port in base URL: ${baseURL}`);
  }

  return {
    hostname: url.hostname,
    port,
  };
}

function defaultPortForProtocol(protocol: string): number {
  if (protocol === "https:") {
    return 443;
  }

  return 80;
}
