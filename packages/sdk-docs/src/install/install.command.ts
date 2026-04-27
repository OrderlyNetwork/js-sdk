import { defaultClientAdapterRegistry } from "./clients.js";
import { backupIfExists, readJsonConfig, writeJsonAtomic } from "./fs-write.js";
import { printInstallReport } from "./report.js";
import { buildServerEntry } from "./spec.js";
import type {
  InstallClient,
  InstallOptions,
  InstallReport,
  InstallResult,
  InstallScope,
} from "./types.js";

const ALL_CLIENTS: InstallClient[] = ["claude", "codex", "cursor", "opencode"];

/**
 * Parse install options from argv list (excluding node/script path).
 */
export function parseInstallArgs(argv: string[]): InstallOptions {
  const getValue = (flag: string): string | undefined => {
    const index = argv.indexOf(flag);
    if (index === -1) return undefined;
    return argv[index + 1];
  };

  const clientArg = getValue("--client") ?? "all";
  const scopeArg = (getValue("--scope") ?? "user") as InstallScope;
  const nameArg = getValue("--name") ?? "orderly-sdk-docs";

  if (scopeArg !== "user" && scopeArg !== "project") {
    throw new Error(`Invalid --scope: ${scopeArg}`);
  }

  const clients =
    clientArg === "all"
      ? ALL_CLIENTS
      : (clientArg
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean) as InstallClient[]);

  for (const c of clients) {
    if (!ALL_CLIENTS.includes(c)) {
      throw new Error(`Invalid --client value: ${c}`);
    }
  }

  return {
    clients,
    scope: scopeArg,
    dryRun: argv.includes("--dry-run"),
    force: argv.includes("--force"),
    name: nameArg,
  };
}

/**
 * Execute config installation for all requested clients.
 */
export function runInstallCommand(
  options: InstallOptions,
  cwd = process.cwd(),
): InstallReport {
  const entry = buildServerEntry({ name: options.name });
  const results: InstallResult[] = [];
  const errors: string[] = [];

  const phasePrefix = options.dryRun ? "[dry-run]" : "[install]";
  for (const client of options.clients) {
    const adapter = defaultClientAdapterRegistry.get(client);
    if (!adapter) {
      errors.push(`${client}: no adapter registered for this client`);
      continue;
    }
    const configPath = adapter.resolvePath(options.scope, cwd);

    console.log(
      `${phasePrefix} merging ${client} (${options.scope} scope) -> ${configPath}`,
    );

    try {
      const rawConfig = readJsonConfig(configPath);
      const beforeExists = Object.keys(rawConfig).length > 0;
      const merged = adapter.mergeConfig(
        rawConfig,
        options.name,
        entry,
        options.force,
      );

      let backupPath: string | undefined;
      if (merged.action === "updated" && !options.dryRun) {
        backupPath = backupIfExists(configPath);
        writeJsonAtomic(configPath, merged.merged);
      }

      results.push({
        client,
        path: configPath,
        action:
          merged.action === "noop"
            ? "noop"
            : beforeExists
              ? "updated"
              : "created",
        backupPath,
        changed: merged.action === "updated",
      });
    } catch (error) {
      errors.push(
        `${client} (${configPath}): ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  const report: InstallReport = {
    ok: errors.length === 0,
    results,
    errors,
  };

  printInstallReport(report, options.dryRun);
  return report;
}
