const { spawnSync } = require("child_process");
const chalk = require("chalk");

/**
 * Forward MCP install to sdk-docs so install ownership stays centralized.
 * Uses the package default bin (single-bin layout). If multiple bins are
 * added later, switch to an explicit command or `npm exec --package=... -- <cmd>`.
 */
function forwardToSdkDocs(argv) {
  console.log(
    chalk.cyan("orderly-devkit:") +
      " Installing Orderly SDK Docs MCP config via npx…",
  );
  console.log(
    chalk.dim("First run may download @orderly.network/sdk-docs; please wait."),
  );

  const command = "npx";
  const args = ["-y", "@orderly.network/sdk-docs", "install"];

  if (argv.client) args.push("--client", String(argv.client));
  if (argv.scope) args.push("--scope", String(argv.scope));
  if (argv.name) args.push("--name", String(argv.name));
  if (argv["dry-run"]) args.push("--dry-run");
  if (argv.force) args.push("--force");

  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.error) {
    throw result.error;
  }
  return result.status ?? 1;
}

module.exports = {
  command: "install",
  describe:
    "Install Orderly SDK Docs MCP config for Claude/Codex/Cursor/OpenCode",
  builder: (yargs) => {
    return yargs
      .option("client", {
        type: "string",
        describe:
          "Target client(s): claude|codex|cursor|opencode|all (comma-separated supported)",
        default: "all",
      })
      .option("scope", {
        type: "string",
        choices: ["user", "project"],
        default: "user",
      })
      .option("name", {
        type: "string",
        describe: "MCP server name in config mcpServers map",
        default: "orderly-sdk-docs",
      })
      .option("dry-run", {
        type: "boolean",
        default: false,
      })
      .option("force", {
        type: "boolean",
        default: false,
      })
      .example(
        "orderly-devkit mcp install --client cursor --scope project",
        "Install MCP entry for Cursor in project scope",
      );
  },
  handler: async (argv) => {
    const status = forwardToSdkDocs(argv);
    process.exitCode = status;
  },
};
