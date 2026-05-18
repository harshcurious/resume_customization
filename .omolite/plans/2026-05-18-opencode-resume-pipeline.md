# Opencode Resume Customization Pipeline

> **For agentic workers:** Use Architect agent to execute this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a minimal TypeScript pipeline that customizes `main.tex` for a target job posting using the OpenCode SDK, compile-and-retry logic, PDF review, and a manual git approval gate.
**Architecture:** Use one controller-owned workflow with a single OpenCode session per run. The controller owns deterministic steps such as job-post fetch, compile exit-code handling, retry limits, artifact paths, and final approval, while OpenCode handles TeX edits and PDF review turns. `main.tex` remains the editable source resume, and `context/gemini-share-bed999fa3153.md` is supplemental source material.
**Tech Stack:** TypeScript, Node.js, OpenCode SDK, LaTeX (`latexmk`), local filesystem, git.

---

## Current State

- Existing files:
  - `main.tex`
  - `context/gemini-share-bed999fa3153.md`
  - `README.md`
- No package manifest, no runtime code, no test harness, and no pipeline scaffolding yet.
- The Gemini share is accessible through a mirror path, so the implementation should treat that source as pre-fetched local context instead of depending on live Gemini scraping at runtime.

---

### Task 1: Define runtime boundaries and repo layout

**Files:**
- Create: `docs/pipeline-architecture.md`
- Modify: `README.md`

**Description:**
Document the exact runtime boundary before writing code: what the outer controller owns, what OpenCode owns, which files are authoritative, where generated artifacts go, and which steps are interactive versus automated. This freezes the shape of the system so the later scaffold does not drift into a larger codebase than needed.

**Verification:**
- Run: `test -f docs/pipeline-architecture.md && test -f README.md`
- Expected: both files exist and describe the controller/session split, source inputs, output artifacts, and approval gate.

- [ ] Task 1

---

### Task 2: Scaffold the smallest runnable TypeScript project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `src/main.ts`
- Create: `src/config.ts`
- Create: `.env.example`
- Modify: `.gitignore`

**Description:**
Create only the minimum project scaffold needed to run a local controller: package metadata, TypeScript config, one entrypoint, one config module, and environment variable documentation. Do not add framework layers or extra tooling until the loop exists end-to-end.

**Verification:**
- Run: `bunx tsc --noEmit`
- Expected: the initial scaffold type-checks without implementation placeholders breaking compilation.

- [ ] Task 2

---

### Task 3: Add source-context ingestion for job text and resume context

**Files:**
- Create: `src/inputs/fetch-job-posting.ts`
- Create: `src/inputs/load-resume-context.ts`
- Create: `src/types/source-context.ts`
- Create: `fixtures/job-posting-sample.md`

**Description:**
Implement one input layer for the target job posting and one for local resume context. The job-posting loader should fetch and normalize content from a URL. The resume-context loader should read `main.tex` and the stored Gemini import so the controller can build a clean prompt payload without scraping live sources during a run.

**Verification:**
- Run: `bun run src/main.ts --dry-run --job fixtures/job-posting-sample.md`
- Expected: the program prints or logs a normalized input summary showing `main.tex` and Gemini context were loaded successfully.

- [ ] Task 3

---

### Task 4: Wrap OpenCode session creation and prompt helpers

**Files:**
- Create: `src/opencode/client.ts`
- Create: `src/opencode/session.ts`
- Create: `src/opencode/prompts/editor.md`
- Create: `src/opencode/prompts/reviewer.md`
- Create: `src/opencode/schemas.ts`

**Description:**
Add the minimal OpenCode integration layer: client creation, session lifecycle, prompt construction, `noReply` feedback injection, and structured output schemas for editor and reviewer turns. Keep this layer thin so workflow logic stays in the controller instead of leaking into prompt modules.

**Verification:**
- Run: `bun run src/main.ts --dry-run --job fixtures/job-posting-sample.md`
- Expected: the program reaches the OpenCode preparation stage and emits the planned session/prompt configuration without yet requiring a full live run.

- [ ] Task 4

---

### Task 5: Implement the edit and compile loop

**Files:**
- Create: `src/workflow/edit-resume.ts`
- Create: `src/workflow/compile-resume.ts`
- Create: `src/workflow/run-edit-compile-loop.ts`
- Create: `artifacts/.gitkeep`

**Description:**
Implement the core state machine for editing `main.tex`, compiling with `latexmk`, capturing logs, and retrying on failure. This loop should make compile success deterministic in the controller and only send concise failure context back into OpenCode when a repair turn is needed.

**Verification:**
- Run: `bun run src/main.ts --job fixtures/job-posting-sample.md --max-retries 1`
- Expected: the run either produces a compiled PDF in `artifacts/` or exits with a clear retry/compile failure summary and saved logs.

- [ ] Task 5

---

### Task 6: Implement PDF review and feedback re-entry

**Files:**
- Create: `src/workflow/review-pdf.ts`
- Create: `src/workflow/run-review-loop.ts`
- Modify: `src/workflow/run-edit-compile-loop.ts`

**Description:**
After a successful compile, attach the generated PDF for a second model pass that checks layout and content quality against the job posting. Convert reviewer output into a bounded feedback object, and route only actionable issues back into another edit/compile cycle.

**Verification:**
- Run: `bun run src/main.ts --job fixtures/job-posting-sample.md --max-retries 1`
- Expected: successful compile triggers a reviewer turn; reviewer feedback is either marked passed or fed back into one more edit request with an explicit reason.

- [ ] Task 6

---

### Task 7: Add manual approval and git commit step

**Files:**
- Create: `src/workflow/approval.ts`
- Create: `src/workflow/git-commit.ts`
- Modify: `src/main.ts`

**Description:**
Add a final manual approval gate after a passing PDF review. The controller should show a concise run summary, draft a commit message, and only execute `git add` and `git commit` when explicitly approved. No automatic push behavior should be added.

**Verification:**
- Run: `bun run src/main.ts --job fixtures/job-posting-sample.md --approval-mode manual`
- Expected: the run stops for approval after a passing review and does not create a commit unless approval is given.

- [ ] Task 7

---

### Task 8: Add a narrow smoke test path and usage docs

**Files:**
- Create: `scripts/smoke-test.sh`
- Create: `docs/runbook.md`
- Modify: `README.md`

**Description:**
Add one narrow verification path and operator documentation. The smoke test should exercise the expected command flow with a known sample input and confirm the pipeline reaches the correct checkpoints. The runbook should document required tools, environment variables, and failure recovery steps.

**Verification:**
- Run: `bash scripts/smoke-test.sh`
- Expected: the smoke test completes the intended path or fails with a targeted diagnostic that maps to documented recovery steps.

- [ ] Task 8

---

## Assumptions To Preserve During Execution

- `main.tex` is the canonical editable resume source.
- `context/gemini-share-bed999fa3153.md` is supplemental resume context, not the final source of truth.
- Compile happens outside OpenCode so the controller can branch on real process exit codes.
- PDF review happens in a separate OpenCode model turn after a successful compile.
- Git commit remains manual approval only.
- No full codebase scaffold should be created until this plan is explicitly approved for execution.
