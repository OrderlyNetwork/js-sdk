#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadBundle } from "./bundle.js";
import { errResult } from "./envelope.js";
import { createAiDocsFacade, type AiDocsFacade } from "./facade.js";
import {
  parseInstallArgs,
  runInstallCommand,
} from "./install/install.command.js";
import { registerDocsTools } from "./mcp-tools/registerDocsTools.js";

let facade: AiDocsFacade | null = null;
let loadError: string | null = null;

try {
  facade = createAiDocsFacade(loadBundle());
} catch (e) {
  loadError = e instanceof Error ? e.message : String(e);
}

function guardFacade():
  | { ok: true; facade: AiDocsFacade }
  | { ok: false; payload: string } {
  if (!facade || loadError) {
    return {
      ok: false,
      payload: JSON.stringify(
        errResult(
          "INVALID_INDEX_SHAPE",
          loadError ?? "SDK docs bundle failed to load.",
          "Set ORDERLY_AI_DOCS_REPO_ROOT or run pnpm --filter @orderly.network/ai-docs generate, then pnpm --filter @orderly.network/sdk-docs sync:bundle.",
          null,
        ),
        null,
        2,
      ),
    };
  }
  return { ok: true, facade };
}

const server = new McpServer({
  name: "orderly-sdk-docs",
  version: "0.1.0",
});

registerDocsTools(server, { guardFacade });

/**
 * Some launchers pass the bin name as the first argv token before `install`.
 * Strip that single known prefix so we never fall through to MCP stdio mode.
 */
function normalizeInstallArgv(argv: string[]): string[] {
  if (argv[0] === "orderly-sdk-docs-mcp" && argv[1] === "install") {
    return argv.slice(1);
  }
  return argv;
}

/**
 * Run MCP install flow when user executes:
 * `orderly-sdk-docs-mcp install ...`
 */
async function maybeRunInstallCommand(): Promise<boolean> {
  const argv = normalizeInstallArgv(process.argv.slice(2));
  if (argv[0] !== "install") return false;
  console.log("Starting MCP config installation...");
  const options = parseInstallArgs(argv.slice(1));
  const report = runInstallCommand(options);
  if (!report.ok) {
    process.exitCode = 1;
  }
  return true;
}

async function main() {
  const handledInstall = await maybeRunInstallCommand();
  if (handledInstall) return;
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
