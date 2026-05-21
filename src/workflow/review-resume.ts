import { basename } from "node:path";
import { pathToFileURL } from "node:url";

import type { OpencodeClient } from "@opencode-ai/sdk/client";
import type { Part, SessionPromptData } from "@opencode-ai/sdk/client";

import { createOpencodeClient } from "../opencode/client.js";
import type { OpencodeSessionPreparation } from "../opencode/session.js";
import type { ResumeReviewResponse } from "../opencode/schemas.js";
import type { ResumeContext, SourceDocument } from "../types/source-context.js";

type PromptBody = NonNullable<SessionPromptData["body"]>;

export interface ReviewResumeInput {
  pdfPath: string;
  jobPosting: SourceDocument;
  resumeContext: ResumeContext;
  opencode: OpencodeSessionPreparation;
  sessionID: string;
  client?: Pick<OpencodeClient, "session">;
}

export interface ReviewResumeResult {
  sessionID: string;
  response: ResumeReviewResponse;
  rawResponseText: string;
}

export async function reviewResume(input: ReviewResumeInput): Promise<ReviewResumeResult> {
  const client = input.client ?? createOpencodeClient(input.opencode.client);

  const promptResult = await client.session.prompt({
    path: { id: input.sessionID },
    query: { directory: input.opencode.client.directory },
    body: {
      ...input.opencode.turns.reviewer.message,
      parts: [
        ...input.opencode.turns.reviewer.message.parts,
        createPdfPart(input.pdfPath),
        createTextPart(buildReviewContext(input)),
      ],
    },
  });

  if (promptResult.error) {
    throw new Error(formatSdkError("Failed to request resume PDF review", promptResult.error));
  }

  const rawResponseText = extractTextResponse(promptResult.data?.parts ?? []);

  return {
    sessionID: input.sessionID,
    response: parseResumeReviewResponse(rawResponseText),
    rawResponseText,
  };
}

function buildReviewContext(input: ReviewResumeInput): string {
  return [
    "Runtime inputs:",
    "",
    `Compiled PDF artifact: ${input.pdfPath}`,
    `Job posting source: ${input.jobPosting.source.location}`,
    input.jobPosting.content,
    "",
    `Canonical resume source: ${input.resumeContext.resume.source.location}`,
    input.resumeContext.resume.content,
    "",
    `Supplemental summary source: ${input.resumeContext.supplemental.source.location}`,
    input.resumeContext.supplemental.content,
    "",
    "Review the attached PDF artifact and return JSON matching the reviewer schema.",
  ].join("\n");
}

function createTextPart(text: string): PromptBody["parts"][number] {
  return {
    type: "text",
    text,
  };
}

function createPdfPart(pdfPath: string): PromptBody["parts"][number] {
  return {
    type: "file",
    mime: "application/pdf",
    filename: basename(pdfPath),
    url: pathToFileURL(pdfPath).href,
  };
}

function extractTextResponse(parts: Part[]): string {
  const text = parts
    .filter((part): part is Extract<Part, { type: "text" }> => part.type === "text" && !part.ignored)
    .map((part) => part.text.trim())
    .filter(Boolean)
    .join("\n");

  if (!text) {
    throw new Error("OpenCode reviewer response did not include any text parts");
  }

  return text;
}

function parseResumeReviewResponse(rawText: string): ResumeReviewResponse {
  const normalizedText = stripCodeFence(rawText).trim();

  try {
    return JSON.parse(normalizedText) as ResumeReviewResponse;
  } catch {
    throw new Error("OpenCode reviewer response was not valid JSON");
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
