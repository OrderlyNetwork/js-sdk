---
id: workflow.plugin-create
kind: workflow
domain: plugin-core
docType: workflow
package: "@orderly.network/plugin-core"
packages:
  - "@orderly.network/plugin-core"
intentTags: [plugin, create, scaffold, register, interceptor, plugin-id, skill]
lang: en
summary: Create a new Orderly plugin with recommended skills-first flow and minimal runnable output
---

# Workflow: plugin create

## Goal

Create a new Orderly plugin from scratch and make it runnable with a minimal integration path.

## Inputs

- Desired plugin type (Page / Widget / Layout).
- Initial interception target and expected behavior.
- Workspace destination/package naming constraints.

## Prerequisites

1. Monorepo/workspace is ready and dependencies are installed.
2. You know target plugin shape (Page / Widget / Layout).
3. Host app can load plugins through provider `plugins`.

## Steps

1. **Use skill-first scaffolding (recommended)**:
   - Prefer skill-based generation from the Orderly skills catalog (`orderly-skills/skills`).
   - Recommended flow: use plugin creation/writing skills to scaffold package shape, register function, and minimal interceptor.
2. Choose plugin type and keep first version minimal:
   - Page: route-mounted content.
   - Widget: one target path interception.
   - Layout: desktop layout interception strategy.
3. Set a globally unique plugin ID in plugin register metadata.
4. Implement one small, verifiable behavior at one stable target path.
5. Integrate into host provider `plugins` and run local verification.

## Verification

- Plugin package builds without errors.
- Register function executes during host initialization.
- Target behavior is visible in UI and can be toggled/removed safely.
- No duplicate injection or unexpected wrapper chain.

## Failure recovery

- **Scaffold mismatch**: regenerate with skill-first flow and keep only minimal shape.
- **Plugin ID issues**: replace with unique ID and retest.
- **Target path mismatch**: validate against `packages/plugin-core/doc/injectable-targets.md`.
- **Target not supported by SDK**:
  1. Fallback to nearest supported target to unblock delivery.
  2. If business requires exact anchor, fork SDK and add `injectable` in relevant package component.
  3. Keep a compatibility note so future upstream target support can replace the fork patch.

## Next tool call

- Use `orderly_docs_get_workflow` (`plugin-integration`) to continue from scaffold into host wiring.
- Use `orderly_docs_search` with plugin/interceptor target keywords when target mapping is ambiguous.
- Use `orderly_docs_get_guardrails` before shipping if plugin behavior touches signing/trading safety text.

## Outputs

- A buildable plugin package scaffold with a unique plugin ID.
- One verified interception behavior on a stable target path.
- A ready-to-integrate register function for host `plugins` wiring.

## Fast path

1. Scaffold a minimal plugin with a unique plugin ID.
2. Implement one stable target interception and verify behavior.
3. Continue with `orderly_docs_get_workflow` (`plugin-integration`) for host wiring.

## Related docs

- `packages/plugin-core/doc/GUIDE.md`
- `packages/plugin-core/doc/TECH.md`
- `packages/plugin-core/doc/injectable-targets.md`
- `apps/ai-docs/workflows/plugin-integration.md`
