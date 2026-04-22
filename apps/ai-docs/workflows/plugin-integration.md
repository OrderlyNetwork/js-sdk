---
id: workflow.plugin-integration
kind: workflow
domain: plugin-core
docType: workflow
package: "@orderly.network/plugin-core"
packages:
  - "@orderly.network/plugin-core"
  - "@orderly.network/layout-core"
intentTags:
  [
    plugin,
    integration,
    orderlyappprovider,
    plugins,
    interceptor,
    trading-layout,
  ]
lang: en
summary: Integrate an Orderly plugin into a host app (including layout plugin specifics)
---

# Workflow: plugin integration

## Goal

Integrate an Orderly plugin into a host app using a single, predictable process. This workflow applies to both regular plugins and layout plugins.

## Prerequisites

1. Host app already mounts Orderly app/provider entry (for example `OrderlyAppProvider`).
2. Plugin package is available in workspace dependencies.
3. Plugin exports a register function (for example `registerXxxPlugin()`).

## Steps

1. Add the plugin package to the host app dependency graph (workspace dependency or published package).
2. Import the plugin register function in the host app integration layer.
3. Add the plugin register call into provider `plugins` list in deterministic order.
4. Start app and verify plugin effect appears on target interception path.
5. For multiple plugins on same target, verify chain order and resulting UI behavior.

## Layout plugin specifics

Layout plugin uses the same integration shape (register function + provider `plugins`) and only differs in target/effect:

- Primary target is `Trading.Layout.Desktop`.
- Plugin injects layout strategy behavior when host does not explicitly provide layout props.
- If host already sets layout strategy props, confirm precedence rules and avoid double ownership.

## Verification

- Plugin register function is called during app init.
- Intercept target exists and is spelled exactly (case-sensitive).
- Expected UI appears where target is injected.
- No duplicate rendering or conflicting wrapper chain after enabling plugin.
- For layout cases, desktop layout reacts according to plugin strategy.

## Failure recovery

- **Plugin not visible**: verify `plugins` prop wiring and register function import/export.
- **Target not matched**: confirm target path from injectable targets reference.
- **Unexpected order**: reorder plugin registration list and retest.
- **Layout not applied**: check whether host already passes layout strategy props and clarify ownership.
- **Target not supported by SDK**:
  1. Confirm the desired target is absent from `packages/plugin-core/doc/injectable-targets.md`.
  2. Use the nearest supported parent/adjacent target as a temporary integration point.
  3. If exact anchor is required, fork SDK packages and add `injectable` at the target component (private fork path).
  4. Keep plugin logic target-agnostic where possible so you can switch to official target once upstream support lands.
  5. Track and document the gap (target name, business reason, impacted plugin behavior) for upstream request.

## Related docs

- `packages/plugin-core/doc/GUIDE.md`
- `packages/plugin-core/doc/TECH.md`
- `packages/plugin-core/doc/injectable-targets.md`
- `packages/layout-core/doc/LAYOUT_CUSTOMIZATION.md`
