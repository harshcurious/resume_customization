import { pathToFileURL } from "node:url";

import { formatStartupSummary, loadConfig } from "./config.js";
import { loadJobPosting } from "./inputs/fetch-job-posting.js";
import { loadResumeContext } from "./inputs/load-resume-context.js";
import { prepareOpencodeSession, type OpencodeSessionPreparation } from "./opencode/session.js";
import { ensureOpencodeServer } from "./opencode/server.js";
import type { SourceDocument } from "./types/source-context.js";
import { runEditCompileLoop } from "./workflow/run-edit-compile-loop.js";

interface RunDependencies {
  loadJobPosting?: typeof loadJobPosting;
  loadResumeContext?: typeof loadResumeContext;
  prepareOpencodeSession?: typeof prepareOpencodeSession;
  ensureOpencodeServer?: typeof ensureOpencodeServer;
  runEditCompileLoop?: typeof runEditCompileLoop;
}

export async function run(argv: string[], dependencies: RunDependencies = {}): Promise<string> {
  const config = loadConfig(argv);
  const loadJobPostingImpl = dependencies.loadJobPosting ?? loadJobPosting;
  const loadResumeContextImpl = dependencies.loadResumeContext ?? loadResumeContext;
  const prepareOpencodeSessionImpl = dependencies.prepareOpencodeSession ?? prepareOpencodeSession;
  const ensureOpencodeServerImpl = dependencies.ensureOpencodeServer ?? ensureOpencodeServer;
  const runEditCompileLoopImpl = dependencies.runEditCompileLoop ?? runEditCompileLoop;

  if (!config.jobInput) {
    return formatStartupSummary(config);
  }

  const [jobPosting, resumeContext] = await Promise.all([
    loadJobPostingImpl(config.jobInput),
    loadResumeContextImpl(),
  ]);

  const opencode = await prepareOpencodeSessionImpl({
    jobPosting,
    resumeContext,
  });

  if (!config.dryRun) {
    const managedServer = await ensureOpencodeServerImpl({
      client: opencode.client,
    });

    try {
      const result = await runEditCompileLoopImpl({
        config,
        jobPosting,
        resumeContext,
        opencode: {
          ...opencode,
          client: managedServer.client,
        },
      });

      return typeof result === "string" ? result : JSON.stringify(result, null, 2);
    } finally {
      managedServer.close();
    }
  }

  return JSON.stringify(
    {
      stage: "opencode-prepared",
      config,
      jobPosting: summarizeSourceDocument(jobPosting),
      opencode: summarizeOpencodePreparation(opencode),
      resumeContext: {
        resume: summarizeSourceDocument(resumeContext.resume),
        supplemental: summarizeSourceDocument(resumeContext.supplemental),
      },
    },
    null,
    2,
  );
}

function summarizeSourceDocument(document: SourceDocument): {
  source: SourceDocument["source"];
  characterCount: number;
} {
  return {
    source: document.source,
    characterCount: document.content.length,
  };
}

function summarizeOpencodePreparation(preparation: OpencodeSessionPreparation): {
  client: OpenCodeClientConfigSummary;
  feedbackInjection: {
    noReply: boolean | undefined;
    sdkMethod: "session.promptAsync";
  };
  session: OpencodeSessionPreparation["session"];
  turns: {
    editor: PreparedTurnSummary;
    reviewer: PreparedTurnSummary;
  };
} {
  return {
    client: {
      baseURL: preparation.client.baseURL,
      directory: preparation.client.directory,
    },
    feedbackInjection: {
      noReply: preparation.feedbackInjection.message.noReply,
      sdkMethod: preparation.feedbackInjection.sdkMethod,
    },
    session: preparation.session,
    turns: {
      editor: summarizePreparedTurn(preparation.turns.editor),
      reviewer: summarizePreparedTurn(preparation.turns.reviewer),
    },
  };
}

interface OpenCodeClientConfigSummary {
  baseURL: string;
  directory: string;
}

interface PreparedTurnSummary {
  prompt: {
    path: string;
  };
  responseSchema: {
    name: string;
  };
  sdkMethod: "session.prompt";
  tools: {
    file_edit: boolean;
    terminal: boolean;
  };
}

function summarizePreparedTurn(turn: OpencodeSessionPreparation["turns"]["editor"]): PreparedTurnSummary {
  return {
    prompt: {
      path: turn.prompt.path,
    },
    responseSchema: {
      name: turn.responseSchema.name,
    },
    sdkMethod: turn.sdkMethod,
    tools: turn.tools,
  };
}

function isEntrypoint(): boolean {
  const entryPath = process.argv[1];

  if (!entryPath) {
    return false;
  }

  return import.meta.url === pathToFileURL(entryPath).href;
}

if (isEntrypoint()) {
  void run(process.argv.slice(2))
    .then((output) => {
      console.log(output);
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      process.exitCode = 1;
    });
}
