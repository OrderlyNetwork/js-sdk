---
name: ai-docs-source-metadata-enrichment
description: Improve TypeScript/JSDoc and extraction metadata feeding apps/ai-docs generators (hooks, components, types)—before or alongside doc-template work.
---

# AI Docs Source Metadata Enrichment Skill

This skill is used to **improve extracted metadata quality at source** for `apps/ai-docs`, so generated docs and MCP responses become richer without manually editing generated markdown outputs.

---

## I. Overview

- **Goal**: Improve metadata completeness and semantic quality for hooks/components/types/functions extracted from TypeScript + JSDoc.
- **Typical use cases**:
  - Props descriptions are mostly empty in generated component docs.
  - Hook payloads miss explicit deprecation signals.
  - Generated docs are structurally correct but semantically thin because extraction is weak.
- **Primary outputs**:
  - Enriched JSON entities under `apps/ai-docs/generated/json/`
  - Optional metadata quality stats in manifest/report for validation and CI gates

---

## II. Outline

1. When to use & prerequisites
2. Parameters and scope
3. Standard execution flow
   - 3.1 Baseline sample collection
   - 3.2 Root-cause mapping to extractor files
   - 3.3 Metadata schema extension (additive)
   - 3.4 Extractor implementation updates
   - 3.5 Regenerate and validate
4. Suggested field model
5. Usage examples
6. Relationship to other AI-docs quality skills
7. Recommendations and caveats

---

## III. Detailed Instructions

### 1. When to Use & Prerequisites

Trigger this skill when:

- The user asks to improve AI-docs quality from source rather than patch generated docs.
- MCP results from `orderly_docs_get_hook` / `orderly_docs_get_component_doc` are missing meaningful metadata.
- You need measurable metadata quality improvements before template-level enhancements.

Prerequisites:

- Work in repo root with access to `apps/ai-docs` and `packages/sdk-docs`.
- You can run generation/build commands:
  - `pnpm --filter @orderly.network/ai-docs generate`
  - `pnpm --filter @orderly.network/sdk-docs build`

### 2. Parameters and Scope

Recommended explicit parameters:

1. **`scope` (optional)**: `hooks | components | types | all`
   - Default: `all`
2. **`strict` (optional)**: `true | false`
   - If `true`, treat missing critical metadata as validation failures.
3. **`samples` (optional)**: comma-separated representative symbols
   - Example: `useMarkPrice,useOrderEntry,@orderly.network/ui:Avatar`

Scope boundaries:

- This skill updates extraction and metadata modeling, not final markdown wording templates.
- If template rendering changes are required, hand off to `ai-docs-source-quality-impl`.

### 3. Standard Execution Flow

#### 3.1 Baseline sample collection

- Collect current outputs for representative symbols via facade or MCP:
  - component doc sample(s)
  - hook sample(s), including deprecated-path hooks
- Record concrete gaps (missing descriptions, missing deprecated state, weak return semantics).

#### 3.2 Root-cause mapping to extractor files

- Map each gap to source files:
  - `apps/ai-docs/src/internal/extractSymbols.ts`
  - `apps/ai-docs/src/internal/extractComponents.ts`
  - `apps/ai-docs/src/internal/entityTypes.ts`
  - Optional: `apps/ai-docs/src/internal/sdkPropFilter.ts`

#### 3.3 Metadata schema extension (additive)

- Add new fields as optional to avoid breaking consumers.
- Prefer backward-compatible enrichment, e.g.:
  - `deprecated?: boolean`
  - `deprecationMessage?: string`
  - `docTags?: Record<string, string | boolean>`

#### 3.4 Extractor implementation updates

- Hooks (`extractSymbols.ts`):
  - Parse JSDoc tags such as `@deprecated`, `@returns`, `@see`.
  - Infer deprecation from source path only as fallback when JSDoc is absent.
- Components (`extractComponents.ts`):
  - Preserve and normalize prop `description` and `defaultValue`.
  - Surface component-level descriptions into entity fields consumed downstream.
- Types/functions:
  - Align JSDoc extraction behavior with hooks for consistency.

#### 3.5 Regenerate and validate

Run:

```bash
pnpm --filter @orderly.network/ai-docs generate
pnpm --filter @orderly.network/sdk-docs build
```

Then sample check:

- `orderly_docs_get_hook` returns enriched metadata and deprecation signals.
- `orderly_docs_get_component_doc` reflects improved source metadata indirectly.

---

## IV. Suggested Field Model

Use additive optional fields first:

- **HookEntity**
  - `deprecated?: boolean`
  - `deprecationMessage?: string`
  - `docTags?: Record<string, string | boolean>`
- **ComponentEntity props**
  - stronger normalization for `description` / `defaultValue`
- **Cross-entity**
  - quality counters can be emitted into manifest/report for CI checks.

---

## V. Usage Examples

1. **Full metadata enrichment pass**

```bash
@ai-docs-source-metadata-enrichment scope=all strict=false
```

2. **Hook-focused enrichment with deprecated validation**

```bash
@ai-docs-source-metadata-enrichment scope=hooks strict=true samples=useMarkPrice,useOrderEntry
```

3. **Component-focused enrichment before template improvements**

```bash
@ai-docs-source-metadata-enrichment scope=components samples=@orderly.network/ui:Avatar,@orderly.network/ui:Button
```

---

## VI. Relationship to Other Skills

| Skill                                    | Responsibility                                    |
| ---------------------------------------- | ------------------------------------------------- |
| `ai-docs-source-quality-plan`            | Planning and phased design                        |
| **`ai-docs-source-metadata-enrichment`** | Extraction-layer metadata enrichment              |
| `ai-docs-source-quality-impl`            | Doc generation template/presentation improvements |
| `ai-docs-source-quality-verify`          | End-to-end verification and regression checks     |

Recommended order:

1. `ai-docs-source-quality-plan`
2. `ai-docs-source-metadata-enrichment`
3. `ai-docs-source-quality-impl`
4. `ai-docs-source-quality-verify`

---

## VII. Recommendations & Caveats

- Do not treat generated markdown edits as final fixes; always patch extraction logic.
- Keep enrichment deterministic and avoid noisy heuristics.
- Favor explicit JSDoc/tag semantics over path-based inference.
- Ensure new fields are optional unless all downstream consumers are upgraded.
- Always verify downstream behavior in `packages/sdk-docs` after metadata changes.
