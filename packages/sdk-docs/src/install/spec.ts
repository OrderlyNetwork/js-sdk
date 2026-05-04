import type { BuildEntryOptions } from "./types.js";
import type { McpServerConfigEntry } from "./types_internal.js";

/**
 * Build the canonical MCP server config entry used across all clients.
 * Uses npx to avoid hard-coding platform-specific executable paths.
 */
export function buildServerEntry(
  opts: BuildEntryOptions,
): McpServerConfigEntry {
  const v = opts.sdkDocsVersion?.trim();
  const pkg = v
    ? `@orderly.network/sdk-docs@${v}`
    : "@orderly.network/sdk-docs";
  return {
    command: "npx",
    args: ["-y", pkg, "orderly-sdk-docs-mcp"],
  };
}
