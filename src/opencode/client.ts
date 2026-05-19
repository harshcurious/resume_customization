import { createOpencodeClient as createSdkOpencodeClient, type OpencodeClient } from "@opencode-ai/sdk/client";

export interface OpenCodeClientConfig {
  baseURL: string;
  directory: string;
}

const DEFAULT_BASE_URL = "http://localhost:54321";

export function loadOpenCodeClientConfig(
  env: NodeJS.ProcessEnv = process.env,
  directory: string = process.cwd(),
): OpenCodeClientConfig {
  return {
    baseURL: env.OPENCODE_BASE_URL ?? DEFAULT_BASE_URL,
    directory,
  };
}

export function createOpencodeClient(config: OpenCodeClientConfig = loadOpenCodeClientConfig()): OpencodeClient {
  return createSdkOpencodeClient({
    baseUrl: config.baseURL,
    directory: config.directory,
  });
}
