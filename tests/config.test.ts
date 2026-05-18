import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { loadConfig } from "../src/config.js";

describe("loadConfig", () => {
  it("reads the initial CLI scaffold options", () => {
    const config = loadConfig([
      "--dry-run",
      "--job",
      "fixtures/job-posting-sample.md",
      "--approval-mode",
      "manual",
      "--max-retries",
      "2",
    ]);

    assert.deepEqual(config, {
      dryRun: true,
      jobInput: "fixtures/job-posting-sample.md",
      approvalMode: "manual",
      maxRetries: 2,
    });
  });

  it("uses sane defaults for the initial scaffold", () => {
    assert.deepEqual(loadConfig([]), {
      dryRun: false,
      jobInput: undefined,
      approvalMode: "manual",
      maxRetries: 1,
    });
  });
});
