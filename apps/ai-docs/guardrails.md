---
id: guardrails.root
kind: guardrail
packages: []
summary: Safety and correctness constraints for agents
---

# Guardrails

## Secrets and keys

Never print, log, or commit private keys, seed phrases, or API secrets. Use environment variables and secure storage only.

## Numeric precision

Use `Decimal` from `@orderly.network/utils` for prices, sizes, and PnL — not raw JavaScript `number` arithmetic for financial amounts.

## Signing and wallets

- Confirm chain and network before signing.
- Surface human-readable payloads where the host wallet supports it.
- On signing failure, guide recovery (wrong network, user rejected, RPC error) without retrying blindly.

## Doc versioning

Prefer answers backed by `orderly_get_*` tools with citations over guessing API shapes. If `orderly_docs_health` reports stale indexes, regenerate `apps/ai-docs` or align `EXPECTED_GIT_SHA`.

## Fallback policy

Exact entity lookup must not auto-fallback to semantic search unless the caller sets `allowSemanticFallback: true` after an intentional miss.
