# Pipeline architecture

## Goal

Build a small local controller that customizes `main.tex` for a target job posting, compiles the result, reviews the PDF, and stops for manual approval before any commit.

## Authoritative inputs

- `main.tex`: canonical editable resume source
- `context/gemini-share-bed999fa3153.summary.md`: primary supplemental source material for early runs
- `context/gemini-share-bed999fa3153.md`: full transcript available for fallback reference
- job posting text: target role description provided for a run

`main.tex` remains the final source of truth. Supplemental context can inform edits, but it does not replace the resume source file.

Use a summary-first context policy for the Gemini material: start with the compact summary, include the full transcript path in prompt context, and only pull in more transcript content if the first few runs show that the model needs it.

## Runtime boundary

### Controller responsibilities

The local controller owns every deterministic step:

- load and normalize run inputs
- assemble the prompt payload
- create and track artifact paths
- invoke LaTeX compilation
- inspect compile exit codes and logs
- enforce retry limits
- decide when to stop, retry, review, or request approval
- present a final summary and gate any git commit behind manual approval

### OpenCode responsibilities

OpenCode handles model-driven steps only:

- propose TeX edits for the resume
- receive bounded compile feedback when a repair turn is needed
- review the generated PDF after a successful compile
- return structured feedback for the next controller decision

OpenCode does not own compilation, filesystem policy, retry ceilings, artifact management, or git actions.

## Planned run sequence

1. Read the job posting and local resume context.
2. Start one OpenCode session for the run.
3. Request resume edits against `main.tex`.
4. Write the edited resume candidate.
5. Compile with `latexmk` outside OpenCode.
6. If compile fails, send concise diagnostics back for another edit turn.
7. If compile succeeds, attach the PDF for a separate review turn.
8. If review passes, show a summary and wait for manual approval.
9. Only after approval, run `git add` and `git commit`.

## Artifacts

Generated outputs should live outside the source inputs so each run is easy to inspect.

Planned artifact classes:

- compiled PDF
- compile logs
- temporary edited resume candidate
- structured review output
- final run summary data

## Interaction model

### Automated

- input loading
- session setup
- edit requests
- LaTeX compilation
- retry handling
- PDF review request
- artifact capture

### Interactive

- final approval to create a git commit

No automatic push behavior is part of this design.

## Repo shape for the initial implementation

The first implementation pass should stay small:

- minimal TypeScript controller
- minimal OpenCode integration layer
- focused workflow modules for edit, compile, review, and approval
- narrow smoke test and runbook

The controller should stay thin and explicit. Avoid adding extra framework layers before the end-to-end loop works.
