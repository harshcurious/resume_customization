import { pathToFileURL } from "node:url";

import { formatStartupSummary, loadConfig } from "./config.js";

export function run(argv: string[]): string {
  const config = loadConfig(argv);
  return formatStartupSummary(config);
}

function isEntrypoint(): boolean {
  const entryPath = process.argv[1];

  if (!entryPath) {
    return false;
  }

  return import.meta.url === pathToFileURL(entryPath).href;
}

if (isEntrypoint()) {
  const output = run(process.argv.slice(2));
  console.log(output);
}
