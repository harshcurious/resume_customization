import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import type { RunConfig } from "../config.js";
import type { ResumeReviewIssue } from "../opencode/schemas.js";
import type { OpencodeSessionPreparation } from "../opencode/session.js";
import type { ResumeContext, SourceDocument } from "../types/source-context.js";
import { compileResume, type CompileResumeResult } from "./compile-resume.js";
import { editResume, type EditResumeResult } from "./edit-resume.js";
import { reviewResume, type ReviewResumeResult } from "./review-resume.js";

export interface EditCompileLoopInput {
  config: RunConfig;
  jobPosting: SourceDocument;
  resumeContext: ResumeContext;
  opencode: OpencodeSessionPreparation;
  artifactsRoot?: string;
  dependencies?: {
    editResume?: (input: {
      jobPosting: SourceDocument;
      resumeContext: ResumeContext;
      opencode: OpencodeSessionPreparation;
      sessionID?: string | undefined;
      controllerFeedback?: string | undefined;
      compileFeedback?: string | undefined;
    }) => Promise<EditResumeResult>;
    compileResume?: (input: {
      resumePath: string;
      artifactDirectory: string;
      outputFileName?: string;
      workingDirectory: string;
    }) => Promise<CompileResumeResult>;
    reviewResume?: (input: {
      pdfPath: string;
      jobPosting: SourceDocument;
      resumeContext: ResumeContext;
      opencode: OpencodeSessionPreparation;
      sessionID: string;
    }) => Promise<ReviewResumeResult>;
    createRunId?: () => string;
  };
}

export interface EditCompileLoopResult {
  stage: "review-complete" | "review-failed" | "edit-compile-failed";
  artifactDirectory: string;
  sessionID?: string | undefined;
  compile: {
    attemptCount: number;
    maxRetries: number;
    logPath?: string | undefined;
    pdfPath?: string | undefined;
    summary?: string | undefined;
  };
  edit: {
    summaries: string[];
  };
  review?: {
    attemptCount: number;
    passed: boolean;
    summary: string;
    needsAnotherEditRound: boolean;
    issues: ResumeReviewIssue[];
  };
}

export async function runEditCompileLoop(input: EditCompileLoopInput): Promise<EditCompileLoopResult> {
  const artifactDirectory = await createArtifactDirectory(
    input.artifactsRoot,
    input.dependencies?.createRunId,
  );
  const resumePath = input.resumeContext.resume.source.location;
  const compile = input.dependencies?.compileResume ?? compileResume;
  const edit = input.dependencies?.editResume ?? editResume;
  const review = input.dependencies?.reviewResume ?? reviewResume;
  const originalResume = await readFile(resumePath, "utf8");
  const outputFileName = createResumePdfFileName(input.jobPosting);

  await writeFile(join(artifactDirectory, "main.original.tex"), originalResume, "utf8");

  const summaries: string[] = [];
  let sessionID: string | undefined;
  let controllerFeedback: string | undefined;
  let lastCompileResult: CompileResumeResult | undefined;
  let lastReviewResult: ReviewResumeResult | undefined;
  let reviewAttemptCount = 0;

  try {
    for (let attempt = 1; attempt <= input.config.maxRetries + 1; attempt += 1) {
      const editResult = await edit({
        jobPosting: input.jobPosting,
        resumeContext: input.resumeContext,
        opencode: input.opencode,
        sessionID,
        controllerFeedback,
        compileFeedback: controllerFeedback,
      });

      sessionID = editResult.sessionID;
      summaries.push(editResult.response.summary);

      await writeFile(resumePath, editResult.response.updatedResumeTex, "utf8");
      await writeFile(
        join(artifactDirectory, `resume-attempt-${attempt}.tex`),
        editResult.response.updatedResumeTex,
        "utf8",
      );

      const compileResult = await compile({
        resumePath,
        artifactDirectory,
        outputFileName,
        workingDirectory: input.opencode.client.directory,
      });

      lastCompileResult = compileResult;

      if (!compileResult.ok) {
        controllerFeedback = compileResult.summary;
        continue;
      }

      reviewAttemptCount += 1;

      const currentSessionID = sessionID;

      if (!currentSessionID) {
        throw new Error("Review step requires an OpenCode session id");
      }

      const reviewResult = await review({
        pdfPath: compileResult.pdfPath,
        jobPosting: input.jobPosting,
        resumeContext: input.resumeContext,
        opencode: input.opencode,
        sessionID: currentSessionID,
      });

      lastReviewResult = reviewResult;

      if (!reviewResult.response.needsAnotherEditRound) {
        return {
          stage: "review-complete",
          artifactDirectory,
          sessionID,
          compile: {
            attemptCount: attempt,
            maxRetries: input.config.maxRetries,
            logPath: compileResult.logPath,
            pdfPath: compileResult.pdfPath,
          },
          edit: {
            summaries,
          },
          review: {
            attemptCount: reviewAttemptCount,
            passed: reviewResult.response.passed,
            summary: reviewResult.response.summary,
            needsAnotherEditRound: reviewResult.response.needsAnotherEditRound,
            issues: reviewResult.response.issues,
          },
        };
      }

      controllerFeedback = formatReviewFeedback(reviewResult.response);
    }

    if (lastCompileResult?.ok && lastReviewResult) {
      return {
        stage: "review-failed",
        artifactDirectory,
        sessionID,
        compile: {
          attemptCount: input.config.maxRetries + 1,
          maxRetries: input.config.maxRetries,
          logPath: lastCompileResult.logPath,
          pdfPath: lastCompileResult.pdfPath,
        },
        edit: {
          summaries,
        },
        review: {
          attemptCount: reviewAttemptCount,
          passed: lastReviewResult.response.passed,
          summary: lastReviewResult.response.summary,
          needsAnotherEditRound: lastReviewResult.response.needsAnotherEditRound,
          issues: lastReviewResult.response.issues,
        },
      };
    }

    await writeFile(resumePath, originalResume, "utf8");

    return {
      stage: "edit-compile-failed",
      artifactDirectory,
      sessionID,
      compile: {
        attemptCount: input.config.maxRetries + 1,
        maxRetries: input.config.maxRetries,
        logPath: lastCompileResult?.logPath,
        summary:
          lastCompileResult && !lastCompileResult.ok
            ? lastCompileResult.summary
            : "Compilation failed before a diagnostic summary was captured.",
      },
      edit: {
        summaries,
      },
    };
  } catch (error) {
    await writeFile(resumePath, originalResume, "utf8");

    const message = error instanceof Error ? error.message : String(error);
    const logPath = join(artifactDirectory, "controller-error.log");
    await writeFile(logPath, `${message}\n`, "utf8");

    return {
      stage: "edit-compile-failed",
      artifactDirectory,
      sessionID,
      compile: {
        attemptCount: summaries.length,
        maxRetries: input.config.maxRetries,
        logPath,
        summary: message,
      },
      edit: {
        summaries,
      },
    };
  }
}

async function createArtifactDirectory(
  artifactsRoot: string | undefined,
  createRunId: (() => string) | undefined,
): Promise<string> {
  const root = artifactsRoot ?? resolve(process.cwd(), "artifacts");
  const runID = createRunId?.() ?? createTimestampRunId();
  const artifactDirectory = join(root, runID);

  await mkdir(artifactDirectory, { recursive: true });

  return artifactDirectory;
}

function createTimestampRunId(): string {
  return `run-${new Date().toISOString().replaceAll(":", "-")}`;
}

function formatReviewFeedback(result: ReviewResumeResult["response"]): string {
  const issues = result.issues.length === 0
    ? "No explicit issues were listed."
    : result.issues.map((issue, index) => `${index + 1}. [${issue.severity}] ${issue.detail}`).join("\n");

  return [
    "Controller PDF review feedback:",
    result.summary,
    "Issues:",
    issues,
    "Revise the resume TeX to address the review feedback.",
  ].join("\n\n");
}

function createResumePdfFileName(jobPosting: SourceDocument): string {
  return `Harsh_Kumar_Resume_${deriveCompanySlug(jobPosting)}.pdf`;
}

function deriveCompanySlug(jobPosting: SourceDocument): string {
  const companyName =
    extractCompanyNameFromContent(jobPosting.content)
    ?? extractCompanyNameFromUrl(jobPosting.source)
    ?? "Company";

  const normalized = companyName
    .replace(/\.(ai|co|com|in|io|net|org)\b/gi, "")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || "Company";
}

function extractCompanyNameFromContent(content: string): string | undefined {
  const patterns = [
    /about\s+([^\n:*]+)/i,
    /careers\s+at\s+([^\n:*]+)/i,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern)?.[1]?.trim();

    if (match) {
      return match;
    }
  }

  return undefined;
}

function extractCompanyNameFromUrl(source: SourceDocument["source"]): string | undefined {
  if (source.kind !== "url") {
    return undefined;
  }

  try {
    const hostname = new URL(source.location).hostname;
    const firstLabel = hostname.split(".").find(Boolean);

    if (!firstLabel) {
      return undefined;
    }

    return firstLabel.charAt(0).toUpperCase() + firstLabel.slice(1);
  } catch {
    return undefined;
  }
}
