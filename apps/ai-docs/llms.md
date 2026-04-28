# Orderly SDK — Agent entry

Use the Orderly AI docs tools (`orderly_docs_*`) for SDK integration instead of scanning the full monorepo.

## Routing

| Task                                      | Start with                                                                 |
| ----------------------------------------- | -------------------------------------------------------------------------- |
| Exact component metadata                  | `orderly_docs_get_component`                                               |
| Component narrative/examples markdown     | `orderly_docs_get_component_doc`                                           |
| Exact hook metadata                       | `orderly_docs_get_hook`                                                    |
| Exact type metadata                       | `orderly_docs_get_type`                                                    |
| Package export surface                    | `orderly_docs_get_package_surface`                                         |
| Workflow steps (wallet, account, trading) | `orderly_docs_get_workflow` or `orderly_docs_search` with narrative intent |
| Safety and constraints                    | `orderly_docs_get_guardrails`                                              |
| Runnable snippets                         | `orderly_docs_get_recipe`                                                  |
| SDK source file / excerpt                 | `orderly_docs_fetch_sdk_source`                                            |
| Version / build                           | `orderly_docs_get_release_context`                                         |
| Health / freshness                        | `orderly_docs_health`                                                      |

Always prefer **exact lookup** for symbols; use narrative search only for prose workflows unless `allowSemanticFallback` is explicitly set after a miss.

## Practical lookup notes

- For hooks (`useMarkPrice`, `useOrderEntry`, etc.), call `orderly_docs_get_hook` directly.
- For interceptor targets such as `Trading.OrderEntry.SubmitSection`, call `orderly_docs_get_component` with the full path first.
- If an interceptor target has no concrete component entity, `orderly_docs_get_component` can return a type-backed fallback with `propsType` metadata.
- For component examples/prose docs, use `orderly_docs_get_component_doc` after `orderly_docs_get_component`.
- For SDK source text, use `orderly_docs_fetch_sdk_source`; default ref is `main` so local-only `gitSha` values do not cause universal 404s.

## Core packages (illustrative)

- `@orderly.network/types` — shared types
- `@orderly.network/utils` — utilities including `Decimal`
- `@orderly.network/hooks` — React hooks for trading state
- `@orderly.network/ui` — presentational components

Generated indexes in `apps/ai-docs/generated/` are stamped with `gitSha` and `generatedAt`; cite those fields in answers.
