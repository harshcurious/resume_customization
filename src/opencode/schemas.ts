export interface JsonSchemaObject {
  [key: string]: JsonSchemaValue;
}

export type JsonSchemaValue =
  | string
  | number
  | boolean
  | null
  | JsonSchemaObject
  | Array<JsonSchemaValue>;

export interface StructuredOutputSchema {
  name: string;
  description: string;
  schema: JsonSchemaObject;
}

export interface ResumeEditResponse {
  summary: string;
  updatedResumeTex: string;
  changes: string[];
  needsFullTranscript: boolean;
  notes: string[];
}

export interface ResumeReviewIssue {
  severity: "low" | "medium" | "high";
  detail: string;
}

export interface ResumeReviewResponse {
  passed: boolean;
  summary: string;
  issues: ResumeReviewIssue[];
  needsAnotherEditRound: boolean;
}

export const EDITOR_RESPONSE_SCHEMA: StructuredOutputSchema = {
  name: "resume-edit-response",
  description: "Structured resume edit proposal for a job-targeted TeX update.",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      summary: { type: "string" },
      updatedResumeTex: { type: "string" },
      changes: {
        type: "array",
        items: {
          type: "string",
        },
      },
      needsFullTranscript: { type: "boolean" },
      notes: {
        type: "array",
        items: {
          type: "string",
        },
      },
    },
    required: ["summary", "updatedResumeTex", "changes", "needsFullTranscript", "notes"],
  },
};

export const REVIEWER_RESPONSE_SCHEMA: StructuredOutputSchema = {
  name: "resume-review-response",
  description: "Structured PDF review result for the generated resume artifact.",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      passed: { type: "boolean" },
      summary: { type: "string" },
      issues: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            severity: {
              type: "string",
              enum: ["low", "medium", "high"],
            },
            detail: { type: "string" },
          },
          required: ["severity", "detail"],
        },
      },
      needsAnotherEditRound: { type: "boolean" },
    },
    required: ["passed", "summary", "issues", "needsAnotherEditRound"],
  },
};
