# @orderly.network/sdk-docs

Orderly SDK documentation runtime with MCP server support.

## MCP Install (Claude/Codex/Cursor/OpenCode)

Install Orderly SDK Docs MCP configuration into supported clients:

```bash
# Direct install from sdk-docs CLI
orderly-sdk-docs-mcp install --client all --scope user
```

You can also install via the devkit forwarding command:

```bash
orderly-devkit mcp install --client all --scope user
```

### Supported clients

- `claude`
- `codex`
- `cursor`
- `opencode`
- `all` (default)

### Common options

- `--client <claude|codex|cursor|opencode|all>`: target client(s). Comma-separated values are supported.
- `--scope <user|project>`: install to user-level config or current project config.
- `--dry-run`: preview target paths/actions without changing files.
- `--force`: overwrite Orderly-owned MCP keys for an existing same-name entry.
- `--name <serverName>`: MCP server key in `mcpServers` (default: `orderly-sdk-docs`).

### Examples

```bash
# Preview project-level Cursor install
orderly-sdk-docs-mcp install --client cursor --scope project --dry-run

# Install for Claude + Codex at project scope
orderly-sdk-docs-mcp install --client claude,codex --scope project

# Force refresh a custom server name
orderly-sdk-docs-mcp install --client opencode --name orderly-sdk-docs --force
```
