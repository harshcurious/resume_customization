import type { OpencodeClient } from "@opencode-ai/sdk/client";
import type { Part, SessionPromptData } from "@opencode-ai/sdk/client";

import { createOpencodeClient } from "../opencode/client.js";
import { createNoReplyFeedbackInjection, type OpencodeSessionPreparation } from "../opencode/session.js";
import type { ResumeEditResponse } from "../opencode/schemas.js";
import type { ResumeContext, SourceDocument } from "../types/source-context.js";

type PromptBody = NonNullable<SessionPromptData["body"]>;

export interface EditResumeInput {
  jobPosting: SourceDocument;
  resumeContext: ResumeContext;
  opencode: OpencodeSessionPreparation;
  sessionID?: string | undefined;
  compileFeedback?: string | undefined;
  client?: Pick<OpencodeClient, "session">;
}

export interface EditResumeResult {
  sessionID: string;
  response: ResumeEditResponse;
  rawResponseText: string;
}

export async function editResume(input: EditResumeInput): Promise<EditResumeResult> {
  const client = input.client ?? createOpencodeClient(input.opencode.client);
  const sessionID = input.sessionID ?? (await createSession(client, input.opencode.client.directory));

  if (input.compileFeedback) {
    const feedbackResult = await client.session.promptAsync({
      path: { id: sessionID },
      query: { directory: input.opencode.client.directory },
      body: createNoReplyFeedbackInjection(formatCompileFeedback(input.compileFeedback)),
    });

    if (feedbackResult.error) {
      throw new Error(formatSdkError("Failed to send compile feedback", feedbackResult.error));
    }
  }

  const promptResult = await client.session.prompt({
    path: { id: sessionID },
    query: { directory: input.opencode.client.directory },
    body: {
      ...input.opencode.turns.editor.message,
      parts: [...input.opencode.turns.editor.message.parts, createTextPart(buildEditContext(input))],
    },
  });

  if (promptResult.error) {
    throw new Error(formatSdkError("Failed to request resume edit", promptResult.error));
  }

  const rawResponseText = extractTextResponse(promptResult.data?.parts ?? []);

  return {
    sessionID,
    response: parseResumeEditResponse(rawResponseText),
    rawResponseText,
  };
}

async function createSession(client: Pick<OpencodeClient, "session">, directory: string): Promise<string> {
  const sessionResult = await client.session.create({
    query: { directory },
    body: { title: "resume customization" },
  });

  if (sessionResult.error) {
    throw new Error(formatSdkError("Failed to create OpenCode session", sessionResult.error));
  }

  const sessionID = sessionResult.data?.id;

  if (!sessionID) {
    throw new Error("Failed to create OpenCode session: missing session id");
  }

  return sessionID;
}

function buildEditContext(input: EditResumeInput): string {
  return [
    "Runtime inputs:",
    "",
    `Job posting source: ${input.jobPosting.source.location}`,
    input.jobPosting.content,
    "",
    `Canonical resume source: ${input.resumeContext.resume.source.location}`,
    input.resumeContext.resume.content,
    "",
    `Supplemental summary source: ${input.resumeContext.supplemental.source.location}`,
    input.resumeContext.supplemental.content,
  ].join("\n");
}

function formatCompileFeedback(feedback: string): string {
  return [
    "Controller compile feedback:",
    feedback,
    "Revise the full resume TeX and return JSON matching the editor schema.",
  ].join("\n\n");
}

function createTextPart(text: string): PromptBody["parts"][number] {
  return {
    type: "text",
    text,
  };
}

function extractTextResponse(parts: Part[]): string {
  const text = parts
    .filter((part): part is Extract<Part, { type: "text" }> => part.type === "text" && !part.ignored)
    .map((part) => part.text.trim())
    .filter(Boolean)
    .join("\n");

  if (!text) {
    throw new Error("OpenCode editor response did not include any text parts");
  }

  return text;
}

function parseResumeEditResponse(rawText: string): ResumeEditResponse {
  const normalizedText = stripCodeFence(rawText).trim();

  try {
    return JSON.parse(normalizedText) as ResumeEditResponse;
  } catch {
    throw new Error("OpenCode editor response was not valid JSON");
  }
}

function stripCodeFence(value: string): string {
  const match = value.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return match?.[1] ?? value;
}

function formatSdkError(prefix: string, error: unknown): string {
  const detail = error instanceof Error ? error.message : JSON.stringify(error);
  return `${prefix}: ${detail}`;
}
