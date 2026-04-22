import type { McpServerConfigEntry } from "./types_internal.js";

export type InstallClient = "claude" | "codex" | "cursor" | "opencode";
export type InstallScope = "user" | "project";

export type InstallOptions = {
  clients: InstallClient[];
  scope: InstallScope;
  dryRun: boolean;
  force: boolean;
  name: string;
};

export type InstallClientTarget = {
  client: InstallClient;
  path: string;
};

export type InstallResult = {
  client: InstallClient;
  path: string;
  action: "created" | "updated" | "noop";
  backupPath?: string;
  changed: boolean;
};

export type InstallReport = {
  ok: boolean;
  results: InstallResult[];
  errors: string[];
};

export type BuildEntryOptions = {
  name: string;
};

export type ClientAdapter = {
  client: InstallClient;
  resolvePath(scope: InstallScope, cwd: string): string;
  mergeConfig(
    raw: Record<string, unknown>,
    entryName: string,
    entry: McpServerConfigEntry,
    force: boolean,
  ): { merged: Record<string, unknown>; action: "updated" | "noop" };
};
