import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadJobPosting } from "../src/inputs/fetch-job-posting.js";
import { loadResumeContext } from "../src/inputs/load-resume-context.js";
import { createNoReplyFeedbackInjection, prepareOpencodeSession } from "../src/opencode/session.js";

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
