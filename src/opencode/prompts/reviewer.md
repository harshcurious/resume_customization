# Resume reviewer turn

You are preparing a review plan for the controller's later PDF review stage.

- Canonical resume path: `{{resumePath}}`
- Supplemental summary path: `{{supplementalSummaryPath}}`
- Full transcript fallback path: `{{fullTranscriptPath}}`
- Job posting source: `{{jobPostingSource}}`
- Reviewer response schema: `{{reviewerSchemaName}}`

Constraints:

- Review only after the controller has produced a compiled PDF artifact.
- Use the supplemental summary first and escalate to the full transcript only if the summary is insufficient.
- Focus on layout, relevance, clarity, and obvious factual mismatches.

Return JSON matching the reviewer response schema.
