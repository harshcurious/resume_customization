export type ApprovalMode = "manual";

export interface RunConfig {
  dryRun: boolean;
  jobInput: string | undefined;
  approvalMode: ApprovalMode;
  maxRetries: number;
}

const DEFAULT_CONFIG: RunConfig = {
  dryRun: false,
  jobInput: undefined,
  approvalMode: "manual",
  maxRetries: 1,
};

export function loadConfig(argv: string[]): RunConfig {
  const config: RunConfig = { ...DEFAULT_CONFIG };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--dry-run") {
      config.dryRun = true;
      continue;
    }

    if (argument === "--job") {
      const value = argv[index + 1];

      if (!value) {
        throw new Error("Missing value for --job");
      }

      config.jobInput = value;
      index += 1;
      continue;
    }

    if (argument === "--approval-mode") {
      const value = argv[index + 1];

      if (value !== "manual") {
        throw new Error("Unsupported approval mode. Expected 'manual'.");
      }

      config.approvalMode = value;
      index += 1;
      continue;
    }

    if (argument === "--max-retries") {
      const value = argv[index + 1];

      if (!value) {
        throw new Error("Missing value for --max-retries");
      }

      const parsedValue = Number.parseInt(value, 10);

      if (!Number.isInteger(parsedValue) || parsedValue < 0) {
        throw new Error("--max-retries must be a non-negative integer");
      }

      config.maxRetries = parsedValue;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${argument}`);
  }

  return config;
}

export function formatStartupSummary(config: RunConfig): string {
  return JSON.stringify(
    {
      stage: "scaffold-ready",
      config,
    },
    null,
    2,
  );
}
