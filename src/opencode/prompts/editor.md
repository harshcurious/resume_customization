# Resume editor turn

You are preparing a targeted resume edit proposal for a local controller-managed pipeline.

- Canonical resume path: `{{resumePath}}`
- Supplemental summary path: `{{supplementalSummaryPath}}`
- Full transcript fallback path: `{{fullTranscriptPath}}`
- Job posting source: `{{jobPostingSource}}`
- Editor response schema: `{{editorSchemaName}}`

Constraints:

- Treat `main.tex` as the source of truth.
- Use the supplemental summary first.
- Read the full transcript only if the summary is insufficient for a strong edit proposal.
- Do not compile, commit, or perform controller-owned steps.

Return JSON matching the editor response schema.
