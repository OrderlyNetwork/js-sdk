---
name: mcp-test-sdk-docs
description: Run MCP Inspector test workflow for @orderly.network/sdk-docs, including stdio-safe setup, core tool checks, negative cases, and triage for JSON framing errors.
argument-hint: [quick|full|triage]
---

# MCP Test SDK Docs

Run the `mcp-sdk-docs-test` skill and choose mode by argument.

## Modes

- `quick`: run health + search + component + one negative case.
- `full`: run full checklist from the skill (all core tools + negative cases).
- `triage`: focus on connection failures and stdio framing issues.

If no argument is given, default to `quick`.

## Required Setup

Before MCP Inspector connection, ensure:

1. Build once:
   ```bash
   pnpm --filter @orderly.network/sdk-docs build
   ```
2. Inspector uses stdio-safe launch:
   - command: `node`
   - args: `packages/sdk-docs/dist/mcp-cli.js`
   - cwd: `/Users/leo/orderly/orderly-web`

## Execution Contract

When this command is invoked:

1. Read and follow `.cursor/skills/mcp-sdk-docs-test/SKILL.md`.
2. Execute the selected mode checklist.
3. Return:
   - pass/fail per check
   - failed case root cause
   - exact next-step fix commands/settings
