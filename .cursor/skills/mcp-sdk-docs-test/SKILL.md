---
name: mcp-sdk-docs-test
description: Execute MCP Inspector testing workflow for @orderly.network/sdk-docs. Use when user asks to test MCP tools, validate stdio inspector setup, run smoke/regression checks, or troubleshoot MCP JSON parse issues.
---

# MCP SDK Docs Test Skill

Use this skill to run a stable MCP test workflow for `@orderly.network/sdk-docs`, especially with MCP Inspector (`stdio`).

## Goals

- Verify MCP server can be started in a protocol-safe way.
- Validate core tools and high-value negative cases.
- Quickly diagnose common Inspector connection failures.

## Critical Setup Rule (stdio safety)

Do **not** use `pnpm run`/`npm run` as Inspector command, because script banner lines can pollute `stdout` and break JSON-RPC framing.

Use:

- `command`: `node`
- `args`: `packages/sdk-docs/dist/mcp-cli.js`
- `cwd`: `/Users/leo/orderly/orderly-web`

Build once before connecting:

```bash
pnpm --filter @orderly.network/sdk-docs build
```

Optional env:

- `ORDERLY_SDK_GITHUB_REF=main` (recommended for `orderly_docs_fetch_sdk_source` smoke)
- `ORDERLY_AI_DOCS_REPO_ROOT=<path>` (when validating a custom docs root)

## Test Flow

### 1) Health check

Tool: `orderly_docs_health`  
Input: `{}`

Pass conditions:

- `ok: true`
- Contains `gitSha`, `generatedAt`, `repoRoot`, `generatedRoot`

### 2) Search and exact lookup chain

1. `orderly_docs_search`
   - Input:
     ```json
     { "query": "wallet connect", "k": 5 }
     ```
2. `orderly_docs_get_component`
   - Input:
     ```json
     { "query": "@orderly.network/ui:Avatar" }
     ```
3. `orderly_docs_get_component_doc`
   - Input:
     ```json
     { "query": "@orderly.network/ui:Avatar" }
     ```
4. `orderly_docs_get_type`
   - Input:
     ```json
     { "query": "TabTypes" }
     ```
5. `orderly_docs_get_hook`
   - Input:
     ```json
     { "query": "useOrderEntry" }
     ```

### 3) Narrative and package context

- `orderly_docs_get_workflow` with `{ "slug": "wallet-connect" }`
- `orderly_docs_get_recipe` with `{ "name": "order-minimal" }`
- `orderly_docs_get_guardrails` with `{}`
- `orderly_docs_get_release_context` with `{}`
- `orderly_docs_get_package_surface` with `{ "packageName": "@orderly.network/ui" }`

### 4) Source fetch checks

Tool: `orderly_docs_fetch_sdk_source`

- Baseline:
  ```json
  { "relPath": "packages/ui/src/avatar/avatar.tsx" }
  ```
- Windowed:
  ```json
  {
    "relPath": "packages/ui/src/avatar/avatar.tsx",
    "line": 20,
    "contextLines": 10
  }
  ```
- Range:
  ```json
  { "relPath": "packages/ui/src/avatar/avatar.tsx", "line": 10, "endLine": 40 }
  ```

## Negative Cases (must be graceful)

1. Empty query schema fail:
   - `orderly_docs_search` with `{ "query": "" }`
2. Unknown symbol:
   - `orderly_docs_get_component` with `{ "query": "NotExistComponentXYZ" }`
3. Path traversal reject:
   - `orderly_docs_fetch_sdk_source` with `{ "relPath": "../secret.txt" }`

Expected: structured error response; no process crash.

## Fast Triage for Inspector Errors

- `Unexpected token '>' ... not valid JSON`:
  - Cause: script logs mixed into stdout.
  - Fix: switch Inspector command to `node packages/sdk-docs/dist/mcp-cli.js`.
- `Unexpected end of JSON input`:
  - Cause: truncated/contaminated stdio stream.
  - Fix: same as above, and reconnect after fresh server start.

## Success Criteria

- Core positive cases return `ok: true`.
- Negative cases fail predictably with structured errors.
- Re-running same request yields stable shape (except timestamp-like fields).
