import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { normalizeSourceText, type SourceDocument } from "../types/source-context.js";

export async function loadJobPosting(jobInput: string): Promise<SourceDocument> {
  if (isUrl(jobInput)) {
    const response = await fetch(jobInput);

    if (!response.ok) {
      throw new Error(`Failed to fetch job posting: ${response.status} ${response.statusText}`);
    }

    return {
      source: {
        kind: "url",
        location: jobInput,
      },
      content: normalizeSourceText(await response.text()),
    };
  }

  const filePath = resolve(process.cwd(), jobInput);

  return {
    source: {
      kind: "file",
      location: filePath,
    },
    content: normalizeSourceText(await readFile(filePath, "utf8")),
  };
}

function isUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}
