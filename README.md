# resume_customization

Local pipeline for customizing `main.tex` to a target job posting with OpenCode.

## Source of truth

- `main.tex`: canonical resume source
- `context/gemini-share-bed999fa3153.summary.md`: compact supplemental resume context
- `context/gemini-share-bed999fa3153.md`: full transcript for fallback reference only

## Planned workflow

1. Load job text and local resume context.
2. Ask OpenCode to propose resume edits.
3. Compile with `latexmk` outside OpenCode.
4. Retry only when compile diagnostics require another edit.
5. Run a separate PDF review turn after a successful compile.
6. Stop for manual approval before any git commit.

The controller owns deterministic steps such as input loading, compile results, retry limits, artifact paths, and the approval gate. OpenCode owns TeX edit turns and PDF review turns.

The current context policy is summary-first: use the compact Gemini summary in early runs, keep the full transcript path available for escalation, and only promote more transcript content if the first few runs show it is necessary.

See `docs/pipeline-architecture.md` for the runtime boundary and repo layout.

## Status

The minimal TypeScript scaffold, task-3 input loading, task-4 OpenCode preparation, and task-5 edit/compile loop are in place. The controller now starts or reuses an OpenCode server for live runs, requests a resume edit, compiles with `latexmk`, and writes artifacts under `artifacts/`.

The next pending stage is task 6: PDF review and feedback re-entry, followed by the manual approval and git commit gate.

![workflow](data/image.png)
