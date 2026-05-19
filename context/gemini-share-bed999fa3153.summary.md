# Gemini Share Summary

- Purpose: compact supplemental context for early pipeline runs
- Full transcript path: `context/gemini-share-bed999fa3153.md`
- Raw archive path: `context/gemini-share-bed999fa3153.raw.md`
- Policy: start with this summary, then inspect the full transcript only if early runs show the model needs more detail

## Key guidance

- `main.tex` remains the canonical resume source.
- Use this file as supporting context only; do not let it override `main.tex` without an explicit merge decision.
- The Gemini conversation contains helpful detail, but most of it is not needed in the base prompt.

## High-value facts from the transcript

- The conversation produced two resume variants: an initial draft and a corrected draft.
- The corrected draft mainly fixed formatting issues in the header, skill-line wrapping, and LaTeX escaping for the less-than symbol.
- The transcript includes additional project detail beyond what is currently present in `main.tex`.

## Additional project detail mentioned in the transcript

### ONE / Onepay

- Overdraft default risk modeling with calibrated XGBoost scorecards
- ACH transaction risk modeling with hybrid low-latency feature retrieval via DynamoDB
- Cash advance credit risk modeling at $100M+ annual transaction volume and 2M+ transactions
- Shared MLE infrastructure using GitLab CI/CD, Airflow, and Databricks

### ZestMoney

- Fraud likelihood modeling for separate onboarding segments
- Cross-sell / propensity modeling with Spark-based XGBoost and LightGBM
- Workforce forecasting to reduce peak-hour call disconnects
- AutoML / ETL optimization including migration from Pandas to Polars
- Centralized model monitoring and collections-related modeling work

## Extra skills and tools mentioned in the transcript

- LangChain
- LangGraph
- Spark ML / Spark MLlib
- Delta Lake
- MLflow
- Cursor
- OpenCode
- Claude Code

## When to open the full transcript

- The job posting strongly aligns with one of the projects summarized above and needs more bullet-level detail
- The model asks for evidence or context that is not present in `main.tex` or this summary
- Early runs show repeated misses that point to missing background rather than prompt quality
