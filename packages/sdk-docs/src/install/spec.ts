import type { BuildEntryOptions } from "./types.js";
import type { McpServerConfigEntry } from "./types_internal.js";

/**
 * Build the canonical MCP server config entry used across all clients.
 * Uses npx to avoid hard-coding platform-specific executable paths.
 */
export function buildServerEntry(_opts: BuildEntryOptions): McpServerConfigEntry {
  return {
    command: "npx",
    args: ["-y", "@orderly.network/sdk-docs", "orderly-sdk-docs-mcp"],
  };
}
