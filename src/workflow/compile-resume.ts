import { access, mkdir, rename, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { spawn } from "node:child_process";

export interface CommandResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
  error: Error | undefined;
}

export interface CompileResumeInput {
  resumePath: string;
  artifactDirectory: string;
  outputFileName?: string;
  workingDirectory?: string;
  commandRunner?: (command: string, args: string[], cwd: string) => Promise<CommandResult>;
}

export interface CompileResumeSuccess {
  ok: true;
  artifactDirectory: string;
  command: string;
  logPath: string;
  pdfPath: string;
}

export interface CompileResumeFailure {
  ok: false;
  artifactDirectory: string;
  command: string;
  logPath: string;
  summary: string;
  exitCode: number | null;
}

export type CompileResumeResult = CompileResumeSuccess | CompileResumeFailure;

export async function compileResume(input: CompileResumeInput): Promise<CompileResumeResult> {
  const workingDirectory = input.workingDirectory ?? process.cwd();
  const runCommand = input.commandRunner ?? runLatexmk;

  await mkdir(input.artifactDirectory, { recursive: true });

  const args = [
    "-pdf",
    "-interaction=nonstopmode",
    "-halt-on-error",
    "-file-line-error",
    `-output-directory=${input.artifactDirectory}`,
    input.resumePath,
  ];
  const command = formatCommand("latexmk", args);
  const logPath = join(input.artifactDirectory, "compile.log");
  const generatedPdfPath = join(
    input.artifactDirectory,
    `${basename(input.resumePath, extname(input.resumePath))}.pdf`,
  );
  const pdfPath = join(input.artifactDirectory, input.outputFileName ?? basename(generatedPdfPath));

  const result = await runCommand("latexmk", args, workingDirectory);
  await writeFile(logPath, formatCompileLog(command, result), "utf8");

  if (result.error) {
    return {
      ok: false,
      artifactDirectory: input.artifactDirectory,
      command,
      logPath,
      summary: "latexmk is unavailable. Install it or add it to PATH before running the pipeline.",
      exitCode: result.exitCode,
    };
  }

  if (result.exitCode !== 0) {
    return {
      ok: false,
      artifactDirectory: input.artifactDirectory,
      command,
      logPath,
      summary: summarizeCompileFailure(result),
      exitCode: result.exitCode,
    };
  }

  try {
    await access(generatedPdfPath);
  } catch {
    return {
      ok: false,
      artifactDirectory: input.artifactDirectory,
      command,
      logPath,
      summary: "latexmk reported success but the expected PDF artifact was not created.",
      exitCode: result.exitCode,
    };
  }

  if (pdfPath !== generatedPdfPath) {
    await rename(generatedPdfPath, pdfPath);
  }

  return {
    ok: true,
    artifactDirectory: input.artifactDirectory,
    command,
    logPath,
    pdfPath,
  };
}

async function runLatexmk(command: string, args: string[], cwd: string): Promise<CommandResult> {
  return new Promise<CommandResult>((resolve) => {
    const child = spawn(command, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    let spawnError: Error | undefined;

    child.stdout.on("data", (chunk: Buffer | string) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk: Buffer | string) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      spawnError = error;
    });

    child.on("close", (exitCode) => {
      resolve({
        exitCode,
        stdout,
        stderr,
        error: spawnError,
      });
    });
  });
}

function summarizeCompileFailure(result: CommandResult): string {
  const combinedOutput = [result.stdout, result.stderr].filter(Boolean).join("\n");
  const lines = combinedOutput
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const importantLine =
    lines.find((line) => line.startsWith("!"))
    ?? lines.find((line) => /error|undefined control sequence|emergency stop/i.test(line))
    ?? lines.at(-1)
    ?? "LaTeX compilation failed.";

  return `LaTeX compilation failed (exit ${result.exitCode ?? "unknown"}): ${importantLine}`;
}

function formatCompileLog(command: string, result: CommandResult): string {
  return [
    `command: ${command}`,
    `exitCode: ${result.exitCode ?? "null"}`,
    result.error ? `error: ${result.error.message}` : undefined,
    "--- stdout ---",
    result.stdout,
    "--- stderr ---",
    result.stderr,
  ]
    .filter((value): value is string => value !== undefined)
    .join("\n");
}

function formatCommand(command: string, args: string[]): string {
  return [command, ...args.map(quoteArgument)].join(" ");
}

function quoteArgument(argument: string): string {
  if (!argument.includes(" ")) {
    return argument;
  }

  return `"${argument.replaceAll('"', '\\"')}"`;
}
