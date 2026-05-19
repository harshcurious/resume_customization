import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import type { SessionPromptAsyncData, SessionPromptData } from "@opencode-ai/sdk/client";

import { loadOpenCodeClientConfig, type OpenCodeClientConfig } from "./client.js";
import { EDITOR_RESPONSE_SCHEMA, REVIEWER_RESPONSE_SCHEMA, type StructuredOutputSchema } from "./schemas.js";
import type { ResumeContext, SourceDocument } from "../types/source-context.js";

const EDITOR_PROMPT_PATH = "src/opencode/prompts/editor.md";
const REVIEWER_PROMPT_PATH = "src/opencode/prompts/reviewer.md";
const FULL_TRANSCRIPT_PATH = "context/gemini-share-bed999fa3153.md";
const TURN_TOOLS = {
  file_edit: false,
  terminal: false,
} as const;

type PromptBody = NonNullable<SessionPromptData["body"]>;
type AsyncPromptBody = NonNullable<SessionPromptAsyncData["body"]>;

export interface PreparedPromptTemplate {
  path: string;
  content: string;
}

export interface PreparedPromptTurn {
  sdkMethod: "session.prompt";
  prompt: PreparedPromptTemplate;
  responseSchema: StructuredOutputSchema;
  tools: typeof TURN_TOOLS;
  message: PromptBody;
}

export interface PreparedNoReplyFeedback {
  sdkMethod: "session.promptAsync";
  message: Pick<AsyncPromptBody, "noReply" | "parts">;
}

export interface OpencodeSessionPreparation {
  client: OpenCodeClientConfig;
  session: {
    lifecycle: "single-session-per-run";
    createMethod: "session.create";
  };
  turns: {
    editor: PreparedPromptTurn;
    reviewer: PreparedPromptTurn;
  };
  feedbackInjection: PreparedNoReplyFeedback;
}

export async function prepareOpencodeSession(input: {
  jobPosting: SourceDocument;
  resumeContext: ResumeContext;
  client?: OpenCodeClientConfig;
}): Promise<OpencodeSessionPreparation> {
  const client = input.client ?? loadOpenCodeClientConfig();

  const [editorPrompt, reviewerPrompt] = await Promise.all([
    loadPromptTemplate(EDITOR_PROMPT_PATH),
    loadPromptTemplate(REVIEWER_PROMPT_PATH),
  ]);

  const promptVariables = {
    editorSchemaName: EDITOR_RESPONSE_SCHEMA.name,
    fullTranscriptPath: FULL_TRANSCRIPT_PATH,
    jobPostingSource: input.jobPosting.source.location,
    resumePath: input.resumeContext.resume.source.location,
    reviewerSchemaName: REVIEWER_RESPONSE_SCHEMA.name,
    supplementalSummaryPath: input.resumeContext.supplemental.source.location,
  };

  return {
    client,
    session: {
      lifecycle: "single-session-per-run",
      createMethod: "session.create",
    },
    turns: {
      editor: {
        sdkMethod: "session.prompt",
        prompt: editorPrompt,
        responseSchema: EDITOR_RESPONSE_SCHEMA,
        tools: TURN_TOOLS,
        message: {
          tools: TURN_TOOLS,
          parts: [
            {
              type: "text",
              text: renderPrompt(editorPrompt.content, promptVariables),
            },
          ],
        },
      },
      reviewer: {
        sdkMethod: "session.prompt",
        prompt: reviewerPrompt,
        responseSchema: REVIEWER_RESPONSE_SCHEMA,
        tools: TURN_TOOLS,
        message: {
          tools: TURN_TOOLS,
          parts: [
            {
              type: "text",
              text: renderPrompt(reviewerPrompt.content, promptVariables),
            },
          ],
        },
      },
    },
    feedbackInjection: {
      sdkMethod: "session.promptAsync",
      message: createNoReplyFeedbackInjection(
        "Controller feedback channel for bounded compile diagnostics or review follow-up.",
      ),
    },
  };
}

export function createNoReplyFeedbackInjection(
  text: string,
): Pick<AsyncPromptBody, "noReply" | "parts"> {
  return {
    noReply: true,
    parts: [
      {
        type: "text",
        text,
      },
    ],
  };
}

async function loadPromptTemplate(relativePath: string): Promise<PreparedPromptTemplate> {
  const path = resolve(process.cwd(), relativePath);

  return {
    path,
    content: await readFile(path, "utf8"),
  };
}

function renderPrompt(template: string, variables: Record<string, string>): string {
  return Object.entries(variables).reduce(
    (content, [key, value]) => content.replaceAll(`{{${key}}}`, value),
    template,
  );
}
