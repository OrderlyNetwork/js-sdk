---
id: capabilities.root
kind: capability
packages: []
summary: What the Orderly AI docs layer can retrieve
---

# Agent capabilities

## Exact metadata

- Components (sampled + expandable): props, defaults, descriptions
- Component markdown docs: examples and narrative via `orderly_docs_get_component_doc`
- Hooks: parameters, return types (TypeScript-resolved when possible)
- Types: interfaces, type aliases, enums
- Package export surfaces
- Interceptor target fallback: `orderly_docs_get_component` may return a type-backed component shape with `propsType` metadata when no concrete component entity exists

## Narrative

- Curated workflows under `workflows/`
- Recipes under `recipes/`
- Guardrails in `guardrails.md`

## Source retrieval

- `orderly_docs_fetch_sdk_source` fetches repo files/excerpts for citation-backed debugging.
- Default source ref is `main`, reducing 404s caused by local-only manifest commits.

## Not covered here

- Live market data, private keys, or broker-specific endpoints
- Full public marketing documentation site
