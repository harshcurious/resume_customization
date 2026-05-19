import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { normalizeSourceText, type ResumeContext } from "../types/source-context.js";

const RESUME_PATH = "main.tex";
const SUPPLEMENTAL_CONTEXT_PATH = "context/gemini-share-bed999fa3153.summary.md";

export async function loadResumeContext(): Promise<ResumeContext> {
  const resumePath = resolve(process.cwd(), RESUME_PATH);
  const supplementalPath = resolve(process.cwd(), SUPPLEMENTAL_CONTEXT_PATH);

  return {
    resume: {
      source: {
        kind: "file",
        location: resumePath,
      },
      content: normalizeSourceText(await readFile(resumePath, "utf8")),
    },
    supplemental: {
      source: {
        kind: "file",
        location: supplementalPath,
      },
      content: normalizeSourceText(await readFile(supplementalPath, "utf8")),
    },
  };
}
