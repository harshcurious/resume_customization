import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadJobPosting } from "../src/inputs/fetch-job-posting.js";
import { loadResumeContext } from "../src/inputs/load-resume-context.js";
import { createNoReplyFeedbackInjection, prepareOpencodeSession } from "../src/opencode/session.js";
import { run } from "../src/main.js";

describe("prepareOpencodeSession", () => {
  it("builds editor and reviewer turn plans from prompt files", async () => {
    const [jobPosting, resumeContext] = await Promise.all([
      loadJobPosting("fixtures/job-posting-sample.md"),
      loadResumeContext(),
    ]);

    const preparation = await prepareOpencodeSession({
      jobPosting,
      resumeContext,
    });

    assert.equal(preparation.client.baseURL, "http://localhost:54321");
    assert.equal(preparation.session.lifecycle, "single-session-per-run");

    assert.equal(preparation.turns.editor.responseSchema.name, "resume-edit-response");
    assert.match(preparation.turns.editor.prompt.path, /src\/opencode\/prompts\/editor\.md$/);

    const editorPart = preparation.turns.editor.message.parts[0];

    if (!editorPart || editorPart.type !== "text") {
      throw new Error("Expected the editor prompt to render as a text part");
    }

    assert.match(
      editorPart.text,
      /Full transcript fallback path: `context\/gemini-share-bed999fa3153\.md`/,
    );
    assert.equal(preparation.turns.editor.tools.file_edit, false);
    assert.equal(preparation.turns.editor.tools.terminal, false);

    assert.equal(preparation.turns.reviewer.responseSchema.name, "resume-review-response");
    assert.match(preparation.turns.reviewer.prompt.path, /src\/opencode\/prompts\/reviewer\.md$/);
  });

  it("builds no-reply feedback injections for repair turns", () => {
    assert.deepEqual(createNoReplyFeedbackInjection("Compile failed near line 12"), {
      noReply: true,
      parts: [
        {
          type: "text",
          text: "Compile failed near line 12",
        },
      ],
    });
  });
});

describe("ensureOpencodeServer", () => {
  it("starts a local server when the configured base url is unavailable", async () => {
    const serverModule = (await import("../src/opencode/server.js").catch(() => ({}))) as Partial<
      typeof import("../src/opencode/server.js")
    >;

    assert.equal(typeof serverModule.ensureOpencodeServer, "function");

    if (typeof serverModule.ensureOpencodeServer !== "function") {
      return;
    }

    let started = false;

    const ensured = await serverModule.ensureOpencodeServer({
      client: {
        baseURL: "http://127.0.0.1:54321",
        directory: process.cwd(),
      },
      healthCheck: async () => false,
      serverFactory: async () => {
        started = true;
        return {
          url: "http://127.0.0.1:54321",
          close() {},
        };
      },
    });

    assert.equal(started, true);
    assert.equal(ensured.started, true);
    assert.equal(ensured.client.baseURL, "http://127.0.0.1:54321");
  });

  it("reuses an already reachable server without starting a new one", async () => {
    const serverModule = (await import("../src/opencode/server.js").catch(() => ({}))) as Partial<
      typeof import("../src/opencode/server.js")
    >;

    assert.equal(typeof serverModule.ensureOpencodeServer, "function");

    if (typeof serverModule.ensureOpencodeServer !== "function") {
      return;
    }

    let started = false;

    const ensured = await serverModule.ensureOpencodeServer({
      client: {
        baseURL: "http://127.0.0.1:54321",
        directory: process.cwd(),
      },
      healthCheck: async () => true,
      serverFactory: async () => {
        started = true;
        return {
          url: "http://127.0.0.1:54321",
          close() {},
        };
      },
    });

    assert.equal(started, false);
    assert.equal(ensured.started, false);
    assert.equal(typeof ensured.close, "function");
  });
});

describe("reviewResume", () => {
  it("attaches the compiled PDF and parses the reviewer response", async () => {
    const reviewModule = (await import("../src/workflow/review-resume.js").catch(() => ({}))) as Partial<
      typeof import("../src/workflow/review-resume.js")
    >;

    assert.equal(typeof reviewModule.reviewResume, "function");

    if (typeof reviewModule.reviewResume !== "function") {
      return;
    }

    const promptCalls: Array<{
      body: {
        parts: Array<{
          type: string;
          text?: string;
          mime?: string;
          filename?: string;
          url?: string;
        }>;
      };
    }> = [];

    const result = await reviewModule.reviewResume({
      sessionID: "session-1",
      pdfPath: "/tmp/artifacts/main.pdf",
      jobPosting: {
        source: { kind: "file", location: "/tmp/job.md" },
        content: "Senior Software Engineer role",
      },
      resumeContext: {
        resume: {
          source: { kind: "file", location: "/tmp/main.tex" },
          content: "resume content",
        },
        supplemental: {
          source: { kind: "file", location: "/tmp/summary.md" },
          content: "summary content",
        },
      },
      opencode: {
        client: { baseURL: "http://127.0.0.1:54321", directory: process.cwd() },
        session: { lifecycle: "single-session-per-run", createMethod: "session.create" },
        turns: {
          editor: {
            sdkMethod: "session.prompt",
            prompt: { path: "/tmp/editor.md", content: "editor" },
            responseSchema: { name: "resume-edit-response", description: "", schema: {} },
            tools: { file_edit: false, terminal: false },
            message: { tools: { file_edit: false, terminal: false }, parts: [{ type: "text", text: "editor" }] },
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
      client: {
        session: {
          prompt: async (request: {
            body: {
              parts: Array<{
                type: string;
                text?: string;
                mime?: string;
                filename?: string;
                url?: string;
              }>;
            };
          }) => {
            promptCalls.push(request);

            return {
              data: {
                parts: [
                  {
                    type: "text",
                    text: JSON.stringify({
                      passed: true,
                      summary: "Looks good.",
                      issues: [],
                      needsAnotherEditRound: false,
                    }),
                  },
                ],
              },
            };
          },
        },
      } as never,
    });

    assert.equal(result.response.passed, true);
    assert.equal(promptCalls.length, 1);
    assert.equal(promptCalls[0]?.body.parts[1]?.type, "file");
    assert.equal(promptCalls[0]?.body.parts[1]?.mime, "application/pdf");
    assert.equal(promptCalls[0]?.body.parts[1]?.filename, "main.pdf");
    assert.match(promptCalls[0]?.body.parts[1]?.url ?? "", /^file:\/\//);
  });
});

describe("run server lifecycle", () => {
  it("starts and closes an opencode server around the live workflow", async () => {
    const runWithDependencies = run as unknown as (
      argv: string[],
      dependencies: Record<string, unknown>,
    ) => Promise<string>;

    let started = false;
    let closed = false;

    const output = await runWithDependencies(["--job", "fixtures/job-posting-sample.md"], {
      loadJobPosting: async () => ({
        source: { kind: "file", location: "/tmp/job.md" },
        content: "job",
      }),
      loadResumeContext: async () => ({
        resume: {
          source: { kind: "file", location: "/tmp/main.tex" },
          content: "resume",
        },
        supplemental: {
          source: { kind: "file", location: "/tmp/summary.md" },
          content: "summary",
        },
      }),
      prepareOpencodeSession: async () => ({
        client: { baseURL: "http://127.0.0.1:54321", directory: process.cwd() },
        session: { lifecycle: "single-session-per-run", createMethod: "session.create" },
        turns: {
          editor: {
            sdkMethod: "session.prompt",
            prompt: { path: "/tmp/editor.md", content: "editor" },
            responseSchema: { name: "resume-edit-response", description: "", schema: {} },
            tools: { file_edit: false, terminal: false },
            message: { tools: { file_edit: false, terminal: false }, parts: [{ type: "text", text: "editor" }] },
          },
          reviewer: {
            sdkMethod: "session.prompt",
            prompt: { path: "/tmp/reviewer.md", content: "reviewer" },
            responseSchema: { name: "resume-review-response", description: "", schema: {} },
            tools: { file_edit: false, terminal: false },
            message: { tools: { file_edit: false, terminal: false }, parts: [{ type: "text", text: "reviewer" }] },
          },
        },
        feedbackInjection: {
          sdkMethod: "session.promptAsync",
          message: { noReply: true, parts: [{ type: "text", text: "feedback" }] },
        },
      }),
      ensureOpencodeServer: async ({ client }: { client: { baseURL: string; directory: string } }) => {
        started = true;
        return {
          started: true,
          client,
          close() {
            closed = true;
          },
        };
      },
      runEditCompileLoop: async () => ({
        stage: "edit-compile-complete",
        artifactDirectory: "/tmp/artifacts/run-1",
        compile: { attemptCount: 1, maxRetries: 1 },
        edit: { summaries: ["done"] },
      }),
    });

    assert.equal(started, true);
    assert.equal(closed, true);
    assert.equal(JSON.parse(output).stage, "edit-compile-complete");
  });
});
