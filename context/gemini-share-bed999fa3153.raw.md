# Gemini Share Raw Capture

- Source URL: `https://gemini.google.com/share/bed999fa3153`
- Retrieved: `2026-05-18`
- Capture mode: browser-rendered body text
- Purpose: preserve the noisy published page text exactly enough for later audits

```text
Sign in
Gemini
About Gemini
Opens in a new window
Gemini App
Opens in a new window
Subscriptions
Opens in a new window
For Business
Opens in a new window
Resume Improvement: Financial Models
https://gemini.google.com/share/bed999fa3153
Created with Thinking March 9, 2026 at 11:02 PM
Published May 18, 2026 at 01:51 PM
You said

Create a latex document to generate the resume. Use the formatting as provided in the uploaded pdf.

Here is the LaTeX code for your resume. It is structured using standard, clean formatting that mimics the professional academic style commonly used for engineering resumes, while incorporating all of our recent technical updates.

You can copy and paste this directly into a LaTeX editor like Overleaf to generate your PDF.

Code snippet
\documentclass[10pt, letterpaper]{article}

% Packages for formatting
\usepackage[left=0.6in, right=0.6in, top=0.6in, bottom=0.6in]{geometry}
\usepackage{hyperref}
\usepackage{enumitem}
\usepackage{titlesec}
\usepackage{xcolor}

% Hyperlink setup
\hypersetup{
    colorlinks=true,
    linkcolor=blue,
    filecolor=magenta,
    urlcolor=blue,
    pdftitle={Harsh Kumar - Resume},
}

% Formatting sections to match the clean style
\titleformat{\section}{\large\bfseries\uppercase}{}{0em}{}[\vspace{-0.5ex}\rule{\textwidth}{0.5pt}]
\titlespacing{\section}{0pt}{1.5ex}{1ex}

\begin{document}

% Disable page numbers
\pagestyle{empty}

% --- HEADER ---
\begin{center}
    {\Huge \textbf{Harsh Kumar}} % [cite: 1] \\ \vspace{2mm}
    \href{mailto:eharshkmr@gmail.com}{eharshkmr@gmail.com} | +91 886039 4423 | \href{https://linkedin.com/in/harsh-kumar-a7b98198}{LinkedIn} % [cite: 2] \\
    \href{https://harshcurious.com}{harshcurious.com} | \href{https://github.com/harshcurious}{github.com/harshcurious} % [cite: 3]
\end{center}

% --- SUMMARY ---
\section*{Professional Summary}
\textbf{Decision Scientist \& ML Engineer} with over 5 years of experience building high-impact financial models and scalable production pipelines. Expert in developing real-time risk engines and propensity models managing \textbf{\$100M+ in annual transaction volume} across millions of customers. Proven track record of reducing fraud by \textbf{20\%} and optimizing operations through automated \textbf{CI/CD} and \textbf{Airflow} orchestration. Specialized in transitioning complex research into performant production code using \textbf{Databricks, PySpark, and Polars}.

% --- SKILLS ---
\section*{Skills} % [cite: 4]
\begin{itemize}[leftmargin=0.15in, label={}]
    \item \textbf{Languages:} Python, C, Go % [cite: 5]
    \item \textbf{ML Libraries:} XGBoost, LightGBM, PyTorch, Transformers, Optuna (Distributed Spark), Hyperopt, fbprophet, SHAP, scikit-learn % [cite: 6]
    \item \textbf{Data Technologies:} Databricks, PySpark, Polars, DynamoDB, Snowflake, PostgreSQL, Metabase % [cite: 7]
    \item \textbf{Development Tools:} Airflow, GitLab CI/CD, BentoML, Docker, Kubernetes, AWS SageMaker, Git % [cite: 9]
\end{itemize}

% --- WORK EXPERIENCE ---
\section*{Work Experience} % [cite: 11]

\noindent
\textbf{DECISION SCIENTIST | ONE} \hfill \textbf{Bengaluru, India | 2024 -- Current} % [cite: 12, 14]
\begin{itemize}[leftmargin=0.25in, itemsep=1pt]
    \item \textbf{Overdraft \& ACH Risk:} Developed calibrated \textbf{XGBoost} models for default and real-time transaction risk, reducing fraud rates by \textbf{20\%}. % [cite: 13, 16, 19]
    \item \textbf{High-Scale Infrastructure:} Engineered a \textbf{PySpark} library of 2,000+ features with automated \textbf{PSI/CSI} tracking via \textbf{Databricks Lakehouse} to monitor feature drift. % [cite: 17]
    \item \textbf{Real-Time Systems:} Optimized latency for transaction risk by implementing a hybrid pipeline using \textbf{DynamoDB} for rapid retrieval of batch-processed features. % [cite: 20]
    \item \textbf{MLE Best Practices:} Standardized organization-wide ML deployment using \textbf{GitLab CI/CD} and \textbf{Airflow} DAGs for automated re-training and deployment within \textbf{Databricks}. % [cite: 18]
    \item \textbf{Cash Advance Model:} Architected a credit risk model handling 2M+ transactions (\$100M+ volume), maintaining default rates below industry standards and establishing it as the company's most profitable product.
\end{itemize}

\vspace{1ex}

\noindent
\textbf{DATA SCIENTIST | ZESTMONEY} \hfill \textbf{Bengaluru, KA, IN | 2022 -- 2023} % [cite: 23, 25]
\begin{itemize}[leftmargin=0.25in, itemsep=1pt]
    \item \textbf{Fraud \& Cross-Sell:} Built separate classification models for online/in-store segments and a product cross-sell suite using \textbf{Spark-based XGBoost}, achieving up to \textbf{30\% uplift}. % [cite: 24, 26, 27]
    \item \textbf{Model Serving:} Deployed real-time APIs via \textbf{BentoML} aggregating 8 data sources with \textbf{200-400ms latency}. % [cite: 28]
    \item \textbf{Operations Optimization:} Reduced peak-hour call disconnects from \textbf{50\% to <20\%} by designing a time-series forecasting engine (fbprophet). % [cite: 29, 30]
    \item \textbf{AutoML \& Performance:} Improved ETL latency by \textbf{40\%} by migrating 1,000+ feature pipelines from \textbf{Pandas to Polars}. % [cite: 38, 40]
    \item \textbf{Model Monitoring:} Established the organization’s model monitoring framework and data visualizations to track performance across all deployed models. % [cite: 32, 33, 34]
\end{itemize}

% --- EDUCATION ---
\section*{Education} % [cite: 44]

\noindent
\textbf{M.S. in Mathematics and Scientific Computing} \hfill \textbf{Jul 2016 -- Jun 2017} \\ % [cite: 50, 52]
Indian Institute of Technology Kanpur (IIT Kanpur) \hfill \textbf{GPA: 9.1} % [cite: 51, 52]

\vspace{1ex}

\noindent
\textbf{B.S. in Mathematics and Scientific Computing} \hfill \textbf{Jul 2012 -- Jun 2016} \\ % [cite: 45, 46, 47]
Indian Institute of Technology Kanpur (IIT Kanpur) \hfill \textbf{GPA: 8.4} % [cite: 48, 49]

\end{document}

Would you like me to draft a tailored cover letter focusing on these MLE and Applied Scientist achievements to accompany your new resume?

resume
PDF
You said

The formatting is incorrect

I see exactly what happened. In the generated PDF, the line breaks in the header failed, causing your contact information to spill over into the Professional Summary. Additionally, the "Development Tools" line merged with "Data Technologies" , and the less-than sign (<) wasn't escaped properly, which caused the call disconnect metric to render as "120%" instead of "<20%".
+2

I have fixed the line breaks, correctly formatted the mathematical symbols (using $<$), and updated the code to include the new skills you added, such as Langchain, Langgraph, and Cursor.

Here is the corrected LaTeX code. Copy and paste this entirely over your current file:

Code snippet
\documentclass[10pt, letterpaper]{article}

% Packages for formatting
\usepackage[left=0.6in, right=0.6in, top=0.6in, bottom=0.6in]{geometry}
\usepackage{hyperref}
\usepackage{enumitem}
\usepackage{titlesec}
\usepackage{xcolor}

% Hyperlink setup
\hypersetup{
    colorlinks=true,
    linkcolor=blue,
    filecolor=magenta,
    urlcolor=blue,
    pdftitle={Harsh Kumar - Resume},
}

% Formatting sections to match the clean style
\titleformat{\section}{\large\bfseries\uppercase}{}{0em}{}[\vspace{-0.5ex}\rule{\textwidth}{0.5pt}]
\titlespacing{\section}{0pt}{1.5ex}{1ex}

\begin{document}

% Disable page numbers
\pagestyle{empty}

% --- HEADER ---
\begin{center}
    {\Huge \textbf{Harsh Kumar}} \\[1.5ex]
    \href{mailto:eharshkmr@gmail.com}{eharshkmr@gmail.com} \textbar{} +91 886039 4423 \textbar{} \href{https://linkedin.com/in/harsh-kumar-a7b98198}{LinkedIn} \\[0.5ex]
    \href{https://harshcurious.com}{harshcurious.com} \textbar{} \href{https://github.com/harshcurious}{github.com/harshcurious}
\end{center}

% --- SUMMARY ---
\section*{Professional Summary}
\textbf{Decision Scientist \& ML Engineer} with over 4 years of experience building high-impact financial models and scalable production pipelines. Expert in developing real-time risk engines and propensity models managing \textbf{\$100M+ in annual transaction volume} across millions of customers. Proven track record of reducing fraud by \textbf{20\%} and optimizing operations through automated \textbf{CI/CD} and \textbf{Airflow} orchestration. Specialized in transitioning complex research into performant production code using \textbf{Databricks, PySpark, and Polars}.

% --- SKILLS ---
\section*{Skills}
\begin{itemize}[leftmargin=0.15in, label={}]
    \item \textbf{Languages:} Python, C, Go
    \item \textbf{ML Libraries:} XGBoost, LightGBM, PyTorch, Transformers, Optuna (Distributed Spark), Hyperopt, fbprophet, SHAP, scikit-learn, langchain, langgraph, SparkML
    \item \textbf{Data Technologies:} Databricks, PySpark, Polars, DynamoDB, Snowflake, PostgreSQL, Metabase, Deltalake
    \item \textbf{Development Tools:} Airflow, GitLab CI/CD, BentoML, MLFlow, Docker, Kubernetes, AWS SageMaker, Git, Cursor, Opencode, Claude Code
\end{itemize}

% --- WORK EXPERIENCE ---
\section*{Work Experience}

\noindent
\textbf{DECISION SCIENTIST | ONE} \hfill \textbf{Bengaluru, India | 2024 -- 2026}
\begin{itemize}[leftmargin=0.25in, itemsep=1pt]
    \item \textbf{Overdraft \& ACH Risk:} Developed calibrated \textbf{XGBoost} models for default and real-time transaction risk, reducing fraud rates by upto \textbf{20\%}.
    \item \textbf{High-Scale Infrastructure:} Engineered a \textbf{PySpark} library of 2,000+ features with automated \textbf{PSI/CSI} tracking via \textbf{Databricks Lakehouse} to monitor feature drift.
    \item \textbf{Real-Time Systems:} Optimized latency for transaction risk by implementing a hybrid pipeline using \textbf{DynamoDB} for rapid retrieval of batch-processed features.
    \item \textbf{MLE Best Practices:} Standardized organization-wide ML deployment using \textbf{GitLab CI/CD} and \textbf{Airflow} DAGs for automated re-training and deployment within \textbf{Databricks}.
    \item \textbf{Cash Advance Model:} Architected a credit risk model handling 2M+ transactions (\$100M+ volume), maintaining default rates below industry standards and establishing it as the company's most profitable product.
\end{itemize}

\vspace{1ex}

\noindent
\textbf{DATA SCIENTIST | ZESTMONEY} \hfill \textbf{Bengaluru, KA, IN | 2022 -- 2023}
\begin{itemize}[leftmargin=0.25in, itemsep=1pt]
    \item \textbf{Fraud \& Cross-Sell:} Built separate classification models for online/in-store segments and a product cross-sell suite using \textbf{Spark-based XGBoost}, achieving up to \textbf{30\% uplift}.
    \item \textbf{Model Serving:} Deployed real-time APIs via \textbf{BentoML} aggregating 8 data sources with \textbf{200-400ms latency}.
    \item \textbf{Operations Optimization:} Reduced peak-hour call disconnects from \textbf{50\% to $<$20\%} by designing a time-series forecasting engine (fbprophet).
    \item \textbf{AutoML \& Performance:} Improved ETL latency by \textbf{40\%} by migrating 1,000+ feature pipelines from \textbf{Pandas to Polars}.
    \item \textbf{Model Monitoring:} Established the organization’s model monitoring framework and data visualizations to track performance across all deployed models.
\end{itemize}

% --- EDUCATION ---
\section*{Education}

\noindent
\textbf{M.S. in Mathematics and Scientific Computing} \hfill \textbf{Jul 2016 -- Jun 2017} \\
Indian Institute of Technology Kanpur (IIT Kanpur) \hfill \textbf{GPA: 9.1}

\vspace{1ex}

\noindent
\textbf{B.S. in Mathematics and Scientific Computing} \hfill \textbf{Jul 2012 -- Jun 2016} \\
Indian Institute of Technology Kanpur (IIT Kanpur) \hfill \textbf{GPA: 8.4}

\end{document}

Would you like me to help draft a matching cover letter or optimize your LinkedIn profile summary to reflect these updates next?

You said

Extract the following from the conversations:

1. List of all the work projects along with all the details for each of them

2. The final latex code

3. Export it to a markdown document.

Resume Project Details and LaTeX Export

Below is the summary of your work projects and the finalized LaTeX code extracted from our discussion and your resume documents.

1. Work Projects and Details

Decision Scientist |
ONE (2024 - 2026)

Overdraft Default Risk Model:
+4

Developed a probability scorecard using calibrated XGBoost to estimate default likelihood for customers with overdraft limits.
+4

Engineered a PySpark feature library with over 2,000 signals.
+4

Implemented Databricks Lakehouse for data quality, tracking PSI (Population Stability Index) and CSI (Characteristic Stability Index) to monitor feature drift.
+3

Achieved a 20% reduction in fraud rates while maintaining stable rejection rates.
+4

ACH Transaction Risk Model:
+4

Developed a real-time supervised transaction model using XGBoost to balance performance and latency.
+4

Architected a hybrid pipeline utilizing DynamoDB for fast retrieval of batch-processed, long-term features.
+3

Projected to reduce fraud loss by over 10% while enhancing customer experience.

Cash Advance Model:
+3

Designed a credit risk model managing $100M+ in annual transaction volume for over 1 million customers.
+4

Processed over 2 million transactions, maintaining default rates below industry standards.
+3

Transformed the model into the company's most profitable product.
+3

MLE Infrastructure & Standardization:
+3

Created standardized ML code templates and deployment workflows used organization-wide.
+4

Automated re-training and deployment pipelines using GitLab CI/CD and Airflow DAGs within Databricks.
+3

Data Scientist |
ZestMoney (2022 - 2023)

Fraud Likelihood Estimation:
+4

Built separate classification models for online vs. in-store onboarding segments.
+4

Experimented with 2,000+ features from 8 data sources, improving model performance by 20%.
+4

Served models via BentoML with a latency of 200-400ms.
+4

Cross-Sell & Propensity Model:
+3

Developed a suite of Spark-based XGBoost and LightGBM classification models for a rapidly evolving product lineup.
+3

Achieved an uplift of 5% to 30% across various financial products.
+3

Built reusable training pipelines to handle a dynamic customer base.
+3

Volume Projection (Workforce Management):
+4

Designed a statistical time-series forecasting engine using fbprophet to account for multiple seasonality.
+4

Reduced peak-hour call disconnect rates from 50% to under 20% through automated forecast delivery.
+4

AutoML Platform & ETL Optimization:
+4

Migrated 1,000+ CIBIL feature pipelines from Pandas to Polars, improving ETL latency by 40%.
+4

Built internal ML platforms for automatic modeling of financial data, including automated feature selection.
+4

Model Monitoring Framework:
+4

Created a centralized framework and data visualizations to track performance and visibility for all deployed models.
+4

Collections Models:

Took ownership of multiple models and detailed workflows to prioritize loan recollection strategies.

2. Final LaTeX Code
Code snippet
\documentclass[10pt, letterpaper]{article}

% Packages for formatting
\usepackage[left=0.6in, right=0.6in, top=0.6in, bottom=0.6in]{geometry}
\usepackage{hyperref}
\usepackage{enumitem}
\usepackage{titlesec}
\usepackage{xcolor}

% Hyperlink setup
\hypersetup{
    colorlinks=true,
    linkcolor=blue,
    filecolor=magenta,
    urlcolor=blue,
    pdftitle={Harsh Kumar - Resume},
}

% Formatting sections
\titleformat{\section}{\large\bfseries\uppercase}{}{0em}{}[\vspace{-0.5ex}\rule{\textwidth}{0.5pt}]
\titlespacing{\section}{0pt}{1.5ex}{1ex}

\begin{document}

% Disable page numbers
\pagestyle{empty}

% --- HEADER ---
\begin{center}
    {\Huge \textbf{Harsh Kumar}} \\[1.5ex]
    \href{mailto:eharshkmr@gmail.com}{eharshkmr@gmail.com} \textbar{} +91 886039 4423 \textbar{} \href{https://linkedin.com/in/harsh-kumar-a7b98198}{LinkedIn} \\[0.5ex]
    \href{https://harshcurious.com}{harshcurious.com} \textbar{} \href{https://github.com/harshcurious}{github.com/harshcurious}
\end{center}

% --- SUMMARY ---
\section*{Professional Summary}
\textbf{Decision Scientist \& ML Engineer} with over 4 years of experience building high-impact financial models and scalable production pipelines. Expert in developing real-time risk engines and propensity models managing \textbf{\$100M+ in annual transaction volume} across millions of customers. Proven track record of reducing fraud by \textbf{20\%} and optimizing operations through automated \textbf{CI/CD} and \textbf{Airflow} orchestration. Specialized in transitioning complex research into performant production code using \textbf{Databricks, PySpark, and Polars}.

% --- SKILLS ---
\section*{Skills}
\begin{itemize}[leftmargin=0.15in, label={}]
    \item \textbf{Languages:} Python, C, Go
    \item \textbf{ML Libraries:} XGBoost, LightGBM, PyTorch, Transformers, Optuna (Distributed Spark), Hyperopt, fbprophet, SHAP, scikit-learn, langchain, langgraph, SparkML
    \item \textbf{Data Technologies:} Databricks, PySpark, Polars, DynamoDB, Snowflake, PostgreSQL, Metabase, Deltalake
    \item \textbf{Development Tools:} Airflow, GitLab CI/CD, BentoML, MLFlow, Docker, Kubernetes, AWS SageMaker, Git, Cursor, Opencode, Claude Code
\end{itemize}

% --- WORK EXPERIENCE ---
\section*{Work Experience}

\noindent
\textbf{DECISION SCIENTIST | ONE} \hfill \textbf{Bengaluru, India | 2024 -- 2026}
\begin{itemize}[leftmargin=0.25in, itemsep=1pt]
    \item \textbf{Overdraft \& ACH Risk:} Developed calibrated \textbf{XGBoost} models for default and real-time transaction risk, reducing fraud rates by upto \textbf{20\%}.
    \item \textbf{High-Scale Infrastructure:} Engineered a \textbf{PySpark} library of 2,000+ features with automated \textbf{PSI/CSI} tracking via \textbf{Databricks Lakehouse} to monitor feature drift.
    \item \textbf{Real-Time Systems:} Optimized latency for transaction risk by implementing a hybrid pipeline using \textbf{DynamoDB} for rapid retrieval of batch-processed features.
    \item \textbf{MLE Best Practices:} Standardized organization-wide ML deployment using \textbf{GitLab CI/CD} and \textbf{Airflow} DAGs for automated re-training and deployment within \textbf{Databricks}.
    \item \textbf{Cash Advance Model:} Architected a credit risk model handling 2M+ transactions (\$100M+ volume), maintaining default rates below industry standards and establishing it as the company's most profitable product.
\end{itemize}

\vspace{1ex}

\noindent
\textbf{DATA SCIENTIST | ZESTMONEY} \hfill \textbf{Bengaluru, KA, IN | 2022 -- 2023}
\begin{itemize}[leftmargin=0.25in, itemsep=1pt]
    \item \textbf{Fraud \& Cross-Sell:} Built separate classification models for online/in-store segments and a product cross-sell suite using \textbf{Spark-based XGBoost}, achieving up to \textbf{30\% uplift}.
    \item \textbf{Model Serving:} Deployed real-time APIs via \textbf{BentoML} aggregating 8 data sources with \textbf{200-400ms latency}.
    \item \textbf{Operations Optimization:} Reduced peak-hour call disconnects from \textbf{50\% to $<$20\%} by designing a time-series forecasting engine (fbprophet).
    \item \textbf{AutoML \& Performance:} Improved ETL latency by \textbf{40\%} by migrating 1,000+ feature pipelines from \textbf{Pandas to Polars}.
    \item \textbf{Model Monitoring:} Established the organization’s model monitoring framework and data visualizations to track performance across all deployed models.
\end{itemize}

% --- EDUCATION ---
\section*{Education}

\noindent
\textbf{M.S. in Mathematics and Scientific Computing} \hfill \textbf{Jul 2016 -- Jun 2017} \\
Indian Institute of Technology Kanpur (IIT Kanpur) \hfill \textbf{GPA: 9.1}

\vspace{1ex}

\noindent
\textbf{B.S. in Mathematics and Scientific Computing} \hfill \textbf{Jul 2012 -- Jun 2016} \\
Indian Institute of Technology Kanpur (IIT Kanpur) \hfill \textbf{GPA: 8.4}

\end{document}

+4
Google Privacy Policy
Opens in a new window
Google Terms of Service
Opens in a new window
Your privacy & Gemini Apps
Opens in a new window

Gemini may display inaccurate info, including about people, so double-check its responses.

Sign in
```
