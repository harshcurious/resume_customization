import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { after, describe, it } from "node:test";

import { loadJobPosting } from "../src/inputs/fetch-job-posting.js";
import { run } from "../src/main.js";
import { loadResumeContext } from "../src/inputs/load-resume-context.js";

describe("loadJobPosting", () => {
  it("loads and normalizes a local job posting file", async () => {
    const jobPosting = await loadJobPosting("fixtures/job-posting-sample.md");

    assert.equal(jobPosting.source.kind, "file");
    assert.match(jobPosting.source.location, /fixtures\/job-posting-sample\.md$/);
    assert.match(jobPosting.content, /Senior Software Engineer/);
    assert.equal(jobPosting.content.includes("\r"), false);
  });

  it("fetches and normalizes a remote job posting", async () => {
    const server = createServer((_request, response) => {
      response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
      response.end("Platform Engineer\r\n\r\nOwn build reliability.\r\n");
    });

    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => resolve());
    });

    after(() => {
      server.close();
    });

    const address = getAddressInfo(server.address());

    const jobPosting = await loadJobPosting(`http://127.0.0.1:${address.port}/job.txt`);

    assert.equal(jobPosting.source.kind, "url");
    assert.equal(jobPosting.source.location, `http://127.0.0.1:${address.port}/job.txt`);
    assert.equal(jobPosting.content, "Platform Engineer\n\nOwn build reliability.");
  });
});

function getAddressInfo(address: AddressInfo | string | null): AddressInfo {
  if (address === null || typeof address === "string") {
    throw new Error("Expected an AddressInfo result from server.address()");
  }

  return address;
}

describe("loadResumeContext", () => {
  it("reads the canonical resume and summary-first supplemental context", async () => {
    const context = await loadResumeContext();

    assert.match(context.resume.source.location, /main\.tex$/);
    assert.match(context.supplemental.source.location, /context\/gemini-share-bed999fa3153\.summary\.md$/);
    assert.ok(context.resume.content.length > 0);
    assert.ok(context.supplemental.content.length > 0);
    assert.match(context.supplemental.content, /Full transcript path: `context\/gemini-share-bed999fa3153\.md`/);
  });
});

describe("run", () => {
  it("returns a dry-run input summary once sources are loaded", async () => {
    const output = await run(["--dry-run", "--job", "fixtures/job-posting-sample.md"]);
    const parsed = JSON.parse(output) as {
      stage: string;
      jobPosting: { source: { kind: string }; characterCount: number; content?: string };
      opencode: {
        client: { baseURL: string };
        session: { lifecycle: string };
        turns: {
          editor: { prompt: { path: string } };
          reviewer: { prompt: { path: string } };
        };
      };
      resumeContext: {
        resume: { source: { kind: string }; characterCount: number; content?: string };
        supplemental: { source: { kind: string }; characterCount: number; content?: string };
      };
    };

    assert.equal(parsed.stage, "opencode-prepared");
    assert.equal(parsed.jobPosting.source.kind, "file");
    assert.ok(parsed.jobPosting.characterCount > 0);
    assert.equal(parsed.jobPosting.content, undefined);
    assert.equal(parsed.resumeContext.resume.source.kind, "file");
    assert.ok(parsed.resumeContext.resume.characterCount > 0);
    assert.equal(parsed.resumeContext.resume.content, undefined);
    assert.equal(parsed.resumeContext.supplemental.source.kind, "file");
    assert.ok(parsed.resumeContext.supplemental.characterCount > 0);
    assert.equal(parsed.resumeContext.supplemental.content, undefined);
    assert.equal(parsed.opencode.client.baseURL, "http://localhost:54321");
    assert.equal(parsed.opencode.session.lifecycle, "single-session-per-run");
    assert.match(parsed.opencode.turns.editor.prompt.path, /src\/opencode\/prompts\/editor\.md$/);
    assert.match(parsed.opencode.turns.reviewer.prompt.path, /src\/opencode\/prompts\/reviewer\.md$/);
  });
});
