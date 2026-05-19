export type SourceKind = "file" | "url";

export interface SourceReference {
  kind: SourceKind;
  location: string;
}

export interface SourceDocument {
  source: SourceReference;
  content: string;
}

export interface ResumeContext {
  resume: SourceDocument;
  supplemental: SourceDocument;
}

export function normalizeSourceText(content: string): string {
  return content.replace(/\r\n?/g, "\n").trim();
}
