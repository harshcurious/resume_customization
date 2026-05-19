import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import type { RunConfig } from "../config.js";
import type { OpencodeSessionPreparation } from "../opencode/session.js";
import type { ResumeContext, SourceDocument } from "../types/source-context.js";
import { compileResume, type CompileResumeResult } from "./compile-resume.js";
import { editResume, type EditResumeResult } from "./edit-resume.js";

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
      compileFeedback?: string | undefined;
    }) => Promise<EditResumeResult>;
    compileResume?: (input: {
      resumePath: string;
      artifactDirectory: string;
      workingDirectory: string;
    }) => Promise<CompileResumeResult>;
    createRunId?: () => string;
  };
}

export interface EditCompileLoopResult {
  stage: "edit-compile-complete" | "edit-compile-failed";
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
}

export async function runEditCompileLoop(input: EditCompileLoopInput): Promise<EditCompileLoopResult> {
  const artifactDirectory = await createArtifactDirectory(
    input.artifactsRoot,
    input.dependencies?.createRunId,
  );
  const resumePath = input.resumeContext.resume.source.location;
  const compile = input.dependencies?.compileResume ?? compileResume;
  const edit = input.dependencies?.editResume ?? editResume;
  const originalResume = await readFile(resumePath, "utf8");

  await writeFile(join(artifactDirectory, "main.original.tex"), originalResume, "utf8");

  const summaries: string[] = [];
  let sessionID: string | undefined;
  let compileFeedback: string | undefined;
  let lastCompileResult: CompileResumeResult | undefined;

  try {
    for (let attempt = 1; attempt <= input.config.maxRetries + 1; attempt += 1) {
      const editResult = await edit({
        jobPosting: input.jobPosting,
        resumeContext: input.resumeContext,
        opencode: input.opencode,
        sessionID,
        compileFeedback,
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
        workingDirectory: input.opencode.client.directory,
      });

      lastCompileResult = compileResult;

      if (compileResult.ok) {
        return {
          stage: "edit-compile-complete",
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
        };
      }

      compileFeedback = compileResult.summary;
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
