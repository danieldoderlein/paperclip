import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const execFileAsync = promisify(execFile);

export type KnowledgeRepoSyncResult =
  | { ok: true; repoPath: string }
  | { ok: false; error: string };

function repoDir(dataDir: string, companyId: string): string {
  return join(dataDir, "knowledge-repos", companyId);
}

function buildAuthUrl(url: string, token: string | null | undefined): string {
  if (!token) return url;
  try {
    const parsed = new URL(url);
    parsed.username = token;
    parsed.password = "x-oauth-basic";
    return parsed.toString();
  } catch {
    return url;
  }
}

async function runGit(args: string[], cwd?: string): Promise<{ stdout: string; stderr: string }> {
  return execFileAsync("git", args, {
    cwd,
    timeout: 60_000,
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
  });
}

/**
 * Ensures the company's knowledge repo is cloned and up-to-date.
 * Returns the local path if successful, or an error message.
 * Safe to call on every agent run — fast if repo is already current.
 */
export async function syncKnowledgeRepo(
  dataDir: string,
  companyId: string,
  repoUrl: string,
  repoToken: string | null | undefined,
): Promise<KnowledgeRepoSyncResult> {
  const path = repoDir(dataDir, companyId);
  const authUrl = buildAuthUrl(repoUrl, repoToken);

  try {
    if (existsSync(join(path, ".git"))) {
      // Already cloned — pull latest
      await runGit(["fetch", "--quiet", "origin"], path);
      await runGit(["reset", "--hard", "origin/HEAD"], path);
    } else {
      mkdirSync(path, { recursive: true });
      await runGit(["clone", "--quiet", "--depth=1", authUrl, path]);
    }
    return { ok: true, repoPath: path };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Strip token from error messages before returning
    const sanitized = repoToken ? msg.replaceAll(repoToken, "***") : msg;
    return { ok: false, error: sanitized };
  }
}
