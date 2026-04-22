# Orderly SDK — Agent entry

Use the Orderly AI docs tools (`orderly_*`) for SDK integration instead of scanning the full monorepo.

## Routing

| Task | Start with |
|------|------------|
| Exact component / hook / type / package | `orderly_get_component`, `orderly_get_type`, or `orderly_get_package_surface` |
| Workflow steps (wallet, account, trading) | `orderly_get_workflow` or `orderly_search_docs` with narrative intent |
| Safety and constraints | `orderly_get_guardrails` |
| Runnable snippets | `orderly_get_recipe` |
| Version / build | `orderly_get_release_context` |
| Health / freshness | `orderly_docs_health` |

Always prefer **exact lookup** for symbols; use narrative search only for prose workflows unless `allowSemanticFallback` is explicitly set after a miss.

## Core packages (illustrative)

- `@orderly.network/types` — shared types
- `@orderly.network/utils` — utilities including `Decimal`
- `@orderly.network/hooks` — React hooks for trading state
- `@orderly.network/ui` — presentational components

Generated indexes in `apps/ai-docs/generated/` are stamped with `gitSha` and `generatedAt`; cite those fields in answers.
