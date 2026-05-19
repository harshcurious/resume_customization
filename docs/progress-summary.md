# Progress summary

## What has happened so far

1. Defined the runtime boundary for the resume pipeline.
2. Added task-3 input loading:
   - job postings from local files or URLs
   - canonical resume context from `main.tex`
   - supplemental context from a compact summary file
3. Switched Gemini context to summary-first mode:
   - primary context: `context/gemini-share-bed999fa3153.summary.md`
   - full transcript: `context/gemini-share-bed999fa3153.md`
   - raw archive: `context/gemini-share-bed999fa3153.raw.md`
4. Added task-4 OpenCode preparation:
   - SDK-backed client config
   - single-session-per-run prep shape
   - editor and reviewer prompt templates
   - structured output schemas
   - no-reply feedback injection helper
5. Updated dry-run output to show an `opencode-prepared` summary instead of raw source contents.

## Verification completed

- `bun test`
- `bun run check`
- `bun run src/main.ts --dry-run --job fixtures/job-posting-sample.md`

## Current status

- Task 3: complete
- Task 4: complete
- Next work: task 5, the edit and compile loop

## Note on context size

The project now keeps the full Gemini transcript out of the default prompt path. Early runs use the compact summary, and the full transcript path is retained for fallback only if the model needs more detail.
