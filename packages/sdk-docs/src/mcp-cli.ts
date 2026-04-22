#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadBundle } from "./bundle.js";
import { errResult } from "./envelope.js";
import { createAiDocsFacade, type AiDocsFacade } from "./facade.js";
import {
  parseInstallArgs,
  runInstallCommand,
} from "./install/install.command.js";

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

server.registerTool(
  "orderly_docs_health",
  {
    description:
      "Returns Orderly SDK docs bundle metadata (gitSha, generatedAt, paths). Use to verify repo-local or embedded generated artifacts.",
  },
  async () => {
    const g = guardFacade();
    if (!g.ok) {
      return { content: [{ type: "text" as const, text: g.payload }] };
    }
    const b = g.facade.bundle;
    const payload = {
      ok: true as const,
      gitSha: b.manifest.gitSha,
      generatedAt: b.manifest.generatedAt,
      releaseVersion: b.manifest.releaseVersion,
      repoRoot: b.repoRoot,
      generatedRoot: b.generatedRoot,
    };
    return {
      content: [
        { type: "text" as const, text: JSON.stringify(payload, null, 2) },
      ],
    };
  },
);

server.registerTool(
  "orderly_docs_search",
  {
    description:
      "Search Orderly SDK documentation (narrative markdown, recipes, workflows). Returns a DocsResult with ranked narrativeHits; when present, matchedEntityId or keywordSingletonId point to a concrete symbol or type—call orderly_docs_get_component or orderly_docs_get_type next. Response may also include queryVariants, inferredPackages, and packageSurfaceHints to guide follow-up exact lookups. Optional filters: k (max hits), kinds, packages.",
    inputSchema: {
      query: z.string().min(1).describe("Free-text search query"),
      k: z.number().int().min(1).max(50).optional().describe("Max hits (1–50)"),
      kinds: z.array(z.string()).optional(),
      packages: z.array(z.string()).optional(),
    },
  },
  async (args) => {
    const g = guardFacade();
    if (!g.ok) return { content: [{ type: "text" as const, text: g.payload }] };
    const out = await g.facade.searchDocs({
      query: args.query,
      k: args.k,
      kinds: args.kinds,
      packages: args.packages,
    });
    return {
      content: [{ type: "text" as const, text: JSON.stringify(out, null, 2) }],
    };
  },
);

server.registerTool(
  "orderly_docs_get_component",
  {
    description:
      "Exact component metadata (props, etc.) by symbol, @package/name:Export, or component.* entity id. Returns DocsResult JSON.",
    inputSchema: {
      query: z
        .string()
        .min(1)
        .describe("Symbol, @package/name:Export, or component.* id"),
    },
  },
  async (args) => {
    const g = guardFacade();
    if (!g.ok) return { content: [{ type: "text" as const, text: g.payload }] };
    const out = g.facade.getComponent(args.query);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(out, null, 2) }],
    };
  },
);

server.registerTool(
  "orderly_docs_get_component_doc",
  {
    description:
      "Component markdown (examples / narrative) by symbol, @package/name:Export, or component.* id. For props/types use orderly_docs_get_component first.",
    inputSchema: {
      query: z
        .string()
        .min(1)
        .describe("Symbol, @package/name:Export, or component.* id"),
    },
  },
  async (args) => {
    const g = guardFacade();
    if (!g.ok) return { content: [{ type: "text" as const, text: g.payload }] };
    const out = g.facade.getComponentDoc(args.query);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(out, null, 2) }],
    };
  },
);

server.registerTool(
  "orderly_docs_get_type",
  {
    description:
      "Exact type / enum metadata by symbol, @package/name:Name, or type.* entity id. Returns DocsResult JSON.",
    inputSchema: {
      query: z.string().min(1),
    },
  },
  async (args) => {
    const g = guardFacade();
    if (!g.ok) return { content: [{ type: "text" as const, text: g.payload }] };
    const out = g.facade.getType(args.query);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(out, null, 2) }],
    };
  },
);

server.registerTool(
  "orderly_docs_get_package_surface",
  {
    description:
      "Lists export names for an npm package (e.g. @orderly.network/ui). Returns DocsResult JSON.",
    inputSchema: {
      packageName: z.string().min(1),
    },
  },
  async (args) => {
    const g = guardFacade();
    if (!g.ok) return { content: [{ type: "text" as const, text: g.payload }] };
    const out = g.facade.getPackageSurface(args.packageName);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(out, null, 2) }],
    };
  },
);

server.registerTool(
  "orderly_docs_get_release_context",
  {
    description:
      "Manifest + optional build-stamp.json for gitSha / generatedAt. Returns DocsResult JSON.",
  },
  async () => {
    const g = guardFacade();
    if (!g.ok) return { content: [{ type: "text" as const, text: g.payload }] };
    const out = g.facade.getReleaseContext();
    return {
      content: [{ type: "text" as const, text: JSON.stringify(out, null, 2) }],
    };
  },
);

server.registerTool(
  "orderly_docs_get_workflow",
  {
    description:
      "Curated workflow markdown (slug without .md). Returns DocsResult JSON.",
    inputSchema: {
      slug: z
        .string()
        .min(1)
        .describe("e.g. wallet-connect for workflows/wallet-connect.md"),
    },
  },
  async (args) => {
    const g = guardFacade();
    if (!g.ok) return { content: [{ type: "text" as const, text: g.payload }] };
    const out = g.facade.getWorkflow(args.slug);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(out, null, 2) }],
    };
  },
);

server.registerTool(
  "orderly_docs_get_recipe",
  {
    description:
      "Minimal recipe markdown (name without .md). Returns DocsResult JSON.",
    inputSchema: {
      name: z.string().min(1),
    },
  },
  async (args) => {
    const g = guardFacade();
    if (!g.ok) return { content: [{ type: "text" as const, text: g.payload }] };
    const out = g.facade.getRecipe(args.name);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(out, null, 2) }],
    };
  },
);

server.registerTool(
  "orderly_docs_get_guardrails",
  {
    description:
      "Guardrails and safety constraints markdown. Returns DocsResult JSON.",
  },
  async () => {
    const g = guardFacade();
    if (!g.ok) return { content: [{ type: "text" as const, text: g.payload }] };
    const out = g.facade.getGuardrails();
    return {
      content: [{ type: "text" as const, text: JSON.stringify(out, null, 2) }],
    };
  },
);

server.registerTool(
  "orderly_docs_fetch_sdk_source",
  {
    description:
      "Fetch source file text from the public Orderly JS SDK GitHub repo (OrderlyNetwork/js-sdk). Default ref is manifest.gitSha (404 if that commit is not on GitHub — set ORDERLY_SDK_GITHUB_REF e.g. main). Repo-relative paths only (e.g. packages/ui/src/button/button.tsx). Optional line/endLine returns excerpt; data.text is always full file.",
    inputSchema: {
      relPath: z
        .string()
        .min(1)
        .describe("Repo-relative path, e.g. packages/ui/src/avatar/avatar.tsx"),
      line: z
        .number()
        .int()
        .min(1)
        .optional()
        .describe("1-based line for excerpt center or range start"),
      endLine: z
        .number()
        .int()
        .min(1)
        .optional()
        .describe("1-based inclusive end line (range with line)"),
      contextLines: z
        .number()
        .int()
        .min(0)
        .max(200)
        .optional()
        .describe("Half-window around line when only line is set (default 15)"),
    },
  },
  async (args) => {
    const g = guardFacade();
    if (!g.ok) return { content: [{ type: "text" as const, text: g.payload }] };
    const out = await g.facade.fetchSdkSource({
      relPath: args.relPath,
      line: args.line,
      endLine: args.endLine,
      contextLines: args.contextLines,
    });
    return {
      content: [{ type: "text" as const, text: JSON.stringify(out, null, 2) }],
    };
  },
);

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
