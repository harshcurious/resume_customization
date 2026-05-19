import { pathToFileURL } from "node:url";

import { formatStartupSummary, loadConfig } from "./config.js";
import { loadJobPosting } from "./inputs/fetch-job-posting.js";
import { loadResumeContext } from "./inputs/load-resume-context.js";
import { prepareOpencodeSession, type OpencodeSessionPreparation } from "./opencode/session.js";
import type { SourceDocument } from "./types/source-context.js";

export async function run(argv: string[]): Promise<string> {
  const config = loadConfig(argv);

  if (!config.jobInput) {
    return formatStartupSummary(config);
  }

  const [jobPosting, resumeContext] = await Promise.all([
    loadJobPosting(config.jobInput),
    loadResumeContext(),
  ]);

  const opencode = await prepareOpencodeSession({
    jobPosting,
    resumeContext,
  });

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
