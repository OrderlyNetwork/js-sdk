import { execSync } from "node:child_process";
import process from "node:process";

/**
 * Resolve git SHA for manifest stamping (tech §4.1).
 */
export function resolveGitSha(): string {
  const fromEnv = process.env.GIT_SHA ?? process.env.GITHUB_SHA;
  if (fromEnv && /^[0-9a-f]{7,40}$/i.test(fromEnv.trim())) {
    return fromEnv.trim();
  }
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}
