import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";

import { run } from "../src/main.js";

describe("run task 5 workflow", () => {
  it("runs the edit/compile loop outside dry-run mode", async () => {
    const runWithDependencies = run as unknown as (
      argv: string[],
      dependencies: Record<string, unknown>,
    ) => Promise<string>;

    const output = await runWithDependencies(["--job", "fixtures/job-posting-sample.md", "--max-retries", "2"], {
      loadJobPosting: async () => ({
        source: { kind: "file", location: "/tmp/job.md" },
        content: "Senior Software Engineer role",
      }),
      loadResumeContext: async () => ({
        resume: {
          source: { kind: "file", location: "/tmp/main.tex" },
          content: "original resume",
        },
        supplemental: {
          source: { kind: "file", location: "/tmp/summary.md" },
          content: "summary context",
        },
      }),
      prepareOpencodeSession: async () => ({
        client: { baseURL: "http://localhost:54321", directory: process.cwd() },
        session: { lifecycle: "single-session-per-run", createMethod: "session.create" },
        turns: {
          editor: {
            sdkMethod: "session.prompt",
            prompt: { path: "/tmp/editor.md", content: "editor prompt" },
            responseSchema: { name: "resume-edit-response", description: "", schema: {} },
            tools: { file_edit: false, terminal: false },
            message: { tools: { file_edit: false, terminal: false }, parts: [{ type: "text", text: "editor prompt" }] },
          },
          reviewer: {
            sdkMethod: "session.prompt",
            prompt: { path: "/tmp/reviewer.md", content: "reviewer prompt" },
            responseSchema: { name: "resume-review-response", description: "", schema: {} },
            tools: { file_edit: false, terminal: false },
            message: { tools: { file_edit: false, terminal: false }, parts: [{ type: "text", text: "reviewer prompt" }] },
          },
        },
        feedbackInjection: {
          sdkMethod: "session.promptAsync",
          message: { noReply: true, parts: [{ type: "text", text: "feedback" }] },
        },
      }),
      runEditCompileLoop: async ({ config }: { config: { maxRetries: number } }) =>
        JSON.stringify({
          stage: "edit-compile-complete",
          compile: { attemptCount: config.maxRetries + 1 },
        }),
    });

    const parsed = JSON.parse(output) as {
      stage: string;
      compile: { attemptCount: number };
    };

    assert.equal(parsed.stage, "edit-compile-complete");
    assert.equal(parsed.compile.attemptCount, 3);
  });
});

describe("runEditCompileLoop", () => {
  it("captures a clear latexmk preflight failure and writes a compile log", async () => {
    const compileModule = (await import("../src/workflow/compile-resume.js").catch(() => ({}))) as Partial<
      typeof import("../src/workflow/compile-resume.js")
    >;

    assert.equal(typeof compileModule.compileResume, "function");

    if (typeof compileModule.compileResume !== "function") {
      return;
    }

    const workspace = await mkdtemp(join(tmpdir(), "resume-customization-compile-"));
    after(async () => {
      await rm(workspace, { recursive: true, force: true });
    });

    const artifactDirectory = join(workspace, "artifacts");
    const resumePath = join(workspace, "main.tex");
    await writeFile(resumePath, "\\documentclass{article}", "utf8");

    const result = await compileModule.compileResume({
      resumePath,
      artifactDirectory,
      workingDirectory: workspace,
      commandRunner: async () => ({
        exitCode: null,
        stdout: "",
        stderr: "spawn latexmk ENOENT",
        error: new Error("spawn latexmk ENOENT"),
      }),
    });

    assert.equal(result.ok, false);
    assert.match(result.summary, /latexmk/i);
    assert.match(await readFile(result.logPath, "utf8"), /ENOENT/);
  });

  it("retries once with compile feedback and preserves the last successful edit", async () => {
    const workflowModule = (await import("../src/workflow/run-edit-compile-loop.js").catch(() => ({}))) as Partial<
      typeof import("../src/workflow/run-edit-compile-loop.js")
    >;

    assert.equal(typeof workflowModule.runEditCompileLoop, "function");

    if (typeof workflowModule.runEditCompileLoop !== "function") {
      return;
    }

    const workspace = await mkdtemp(join(tmpdir(), "resume-customization-workflow-"));
    after(async () => {
      await rm(workspace, { recursive: true, force: true });
    });

    const resumePath = join(workspace, "main.tex");
    await mkdir(join(workspace, "artifacts"), { recursive: true });
    await writeFile(resumePath, "original resume", "utf8");

    const feedbackMessages: string[] = [];
    let compileAttempt = 0;

    const result = await workflowModule.runEditCompileLoop({
      config: {
        dryRun: false,
        jobInput: "fixtures/job-posting-sample.md",
        approvalMode: "manual",
        maxRetries: 1,
      },
      jobPosting: {
        source: { kind: "file", location: "/tmp/job.md" },
        content: "Senior Software Engineer role",
      },
      resumeContext: {
        resume: {
          source: { kind: "file", location: resumePath },
          content: "original resume",
        },
        supplemental: {
          source: { kind: "file", location: "/tmp/summary.md" },
          content: "summary context",
        },
      },
      opencode: {
        client: { baseURL: "http://localhost:54321", directory: workspace },
        session: { lifecycle: "single-session-per-run", createMethod: "session.create" },
        turns: {
          editor: {
            sdkMethod: "session.prompt",
            prompt: { path: "/tmp/editor.md", content: "editor prompt" },
            responseSchema: { name: "resume-edit-response", description: "", schema: {} },
            tools: { file_edit: false, terminal: false },
            message: { tools: { file_edit: false, terminal: false }, parts: [{ type: "text", text: "editor prompt" }] },
          },
          reviewer: {
            sdkMethod: "session.prompt",
            prompt: { path: "/tmp/reviewer.md", content: "reviewer prompt" },
            responseSchema: { name: "resume-review-response", description: "", schema: {} },
            tools: { file_edit: false, terminal: false },
            message: { tools: { file_edit: false, terminal: false }, parts: [{ type: "text", text: "reviewer prompt" }] },
          },
        },
        feedbackInjection: {
          sdkMethod: "session.promptAsync",
          message: { noReply: true, parts: [{ type: "text", text: "feedback" }] },
        },
      },
      artifactsRoot: join(workspace, "artifacts"),
      dependencies: {
        editResume: async ({ compileFeedback }: { compileFeedback?: string | undefined }) => {
          feedbackMessages.push(compileFeedback ?? "");

          return {
            sessionID: "session-1",
            rawResponseText: "{}",
            response: {
              summary: compileFeedback ? "fixed resume" : "initial resume",
              updatedResumeTex: compileFeedback ? "fixed resume" : "broken resume",
              changes: [],
              needsFullTranscript: false,
              notes: [],
            },
          };
        },
        compileResume: async ({ artifactDirectory }: { artifactDirectory: string }) => {
          compileAttempt += 1;

          if (compileAttempt === 1) {
            return {
              ok: false,
              artifactDirectory,
              command: "latexmk main.tex",
              logPath: join(artifactDirectory, "compile.log"),
              summary: "Undefined control sequence near line 12",
              exitCode: 1,
            };
          }

          return {
            ok: true,
            artifactDirectory,
            command: "latexmk main.tex",
            logPath: join(artifactDirectory, "compile.log"),
            pdfPath: join(artifactDirectory, "main.pdf"),
          };
        },
        reviewResume: async () => ({
          sessionID: "session-1",
          rawResponseText: "{}",
          response: {
            passed: true,
            summary: "Ready for approval.",
            issues: [],
            needsAnotherEditRound: false,
          },
        }),
      },
    });

    assert.equal(result.stage, "review-complete");
    assert.equal(result.compile.attemptCount, 2);
    assert.equal(feedbackMessages[0], "");
    assert.match(feedbackMessages[1] ?? "", /Undefined control sequence/);
    assert.equal(await readFile(resumePath, "utf8"), "fixed resume");
  });

  it("re-enters editing after PDF review feedback using the same retry budget", async () => {
    const workflowModule = (await import("../src/workflow/run-edit-compile-loop.js").catch(() => ({}))) as Partial<
      typeof import("../src/workflow/run-edit-compile-loop.js")
    >;

    assert.equal(typeof workflowModule.runEditCompileLoop, "function");

    if (typeof workflowModule.runEditCompileLoop !== "function") {
      return;
    }

    const workspace = await mkdtemp(join(tmpdir(), "resume-customization-review-"));
    after(async () => {
      await rm(workspace, { recursive: true, force: true });
    });

    const resumePath = join(workspace, "main.tex");
    await mkdir(join(workspace, "artifacts"), { recursive: true });
    await writeFile(resumePath, "original resume", "utf8");

    const feedbackMessages: string[] = [];
    const reviewInputs: string[] = [];
    let reviewAttempt = 0;

    const result = await workflowModule.runEditCompileLoop({
      config: {
        dryRun: false,
        jobInput: "fixtures/job-posting-sample.md",
        approvalMode: "manual",
        maxRetries: 1,
      },
      jobPosting: {
        source: { kind: "file", location: "/tmp/job.md" },
        content: "Senior Software Engineer role",
      },
      resumeContext: {
        resume: {
          source: { kind: "file", location: resumePath },
          content: "original resume",
        },
        supplemental: {
          source: { kind: "file", location: "/tmp/summary.md" },
          content: "summary context",
        },
      },
      opencode: {
        client: { baseURL: "http://localhost:54321", directory: workspace },
        session: { lifecycle: "single-session-per-run", createMethod: "session.create" },
        turns: {
          editor: {
            sdkMethod: "session.prompt",
            prompt: { path: "/tmp/editor.md", content: "editor prompt" },
            responseSchema: { name: "resume-edit-response", description: "", schema: {} },
            tools: { file_edit: false, terminal: false },
            message: { tools: { file_edit: false, terminal: false }, parts: [{ type: "text", text: "editor prompt" }] },
          },
          reviewer: {
            sdkMethod: "session.prompt",
            prompt: { path: "/tmp/reviewer.md", content: "reviewer prompt" },
            responseSchema: { name: "resume-review-response", description: "", schema: {} },
            tools: { file_edit: false, terminal: false },
            message: { tools: { file_edit: false, terminal: false }, parts: [{ type: "text", text: "reviewer prompt" }] },
          },
        },
        feedbackInjection: {
          sdkMethod: "session.promptAsync",
          message: { noReply: true, parts: [{ type: "text", text: "feedback" }] },
        },
      },
      artifactsRoot: join(workspace, "artifacts"),
      dependencies: {
        editResume: async ({ controllerFeedback }: { controllerFeedback?: string | undefined }) => {
          feedbackMessages.push(controllerFeedback ?? "");

          return {
            sessionID: "session-1",
            rawResponseText: "{}",
            response: {
              summary: controllerFeedback ? "review-fixed resume" : "initial resume",
              updatedResumeTex: controllerFeedback ? "review-fixed resume" : "review-needs-fix resume",
              changes: [],
              needsFullTranscript: false,
              notes: [],
            },
          };
        },
        compileResume: async ({ artifactDirectory }: { artifactDirectory: string }) => ({
          ok: true,
          artifactDirectory,
          command: "latexmk main.tex",
          logPath: join(artifactDirectory, "compile.log"),
          pdfPath: join(artifactDirectory, "main.pdf"),
        }),
        reviewResume: async ({ pdfPath }: { pdfPath: string }) => {
          reviewInputs.push(pdfPath);
          reviewAttempt += 1;

          if (reviewAttempt === 1) {
            return {
              sessionID: "session-1",
              rawResponseText: "{}",
              response: {
                passed: false,
                summary: "The summary is too generic for the job.",
                issues: [{ severity: "medium", detail: "Strengthen the opening summary for backend ownership." }],
                needsAnotherEditRound: true,
              },
            };
          }

          return {
            sessionID: "session-1",
            rawResponseText: "{}",
            response: {
              passed: true,
              summary: "The PDF is ready for approval.",
              issues: [],
              needsAnotherEditRound: false,
            },
          };
        },
      },
    });

    assert.equal(result.stage, "review-complete");
    assert.equal(result.compile.attemptCount, 2);
    assert.equal(result.review?.attemptCount, 2);
    assert.equal(reviewInputs.length, 2);
    assert.equal(feedbackMessages[0], "");
    assert.match(feedbackMessages[1] ?? "", /summary is too generic/i);
    assert.match(feedbackMessages[1] ?? "", /strengthen the opening summary/i);
    assert.equal(await readFile(resumePath, "utf8"), "review-fixed resume");
  });
});
