# resume_customization

Local pipeline for customizing `main.tex` to a target job posting with OpenCode.

## Source of truth

- `main.tex`: canonical resume source
- `context/gemini-share-bed999fa3153.md`: supplemental resume context

## Planned workflow

1. Load job text and local resume context.
2. Ask OpenCode to propose resume edits.
3. Compile with `latexmk` outside OpenCode.
4. Retry only when compile diagnostics require another edit.
5. Run a separate PDF review turn after a successful compile.
6. Stop for manual approval before any git commit.

The controller owns deterministic steps such as input loading, compile results, retry limits, artifact paths, and the approval gate. OpenCode owns TeX edit turns and PDF review turns.

See `docs/pipeline-architecture.md` for the runtime boundary and repo layout.

## Status

Planning is in progress. Runtime code has not been scaffolded yet.

![workflow](data/image.png)
