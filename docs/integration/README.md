# SDK Integration and Upgrade Guides

Use these guides to upgrade an existing Orderly SDK application or integrate
additional features. Version guides explain required migration changes; feature
guides provide the complete setup, configuration options, and implementation examples.

Choose the instructions for your task:

- **Upgrade an existing app:** follow the version guides in the upgrade table below.
- **Add a feature to an existing app:** use its complete [integration guide](#feature-integration-guides).
- **Use AI to integrate:** follow the [AI Integration Workflow](#ai-integration-workflow)
  to inspect the target app, apply the relevant guides, and verify the result.

## Choose an upgrade path

Find your current and target versions, then read the linked guides from left to
right. Install dependencies once for the final target; intermediate installs are
unnecessary.

This table targets 3.3.1 for 3.3.x and 3.4.0 for 3.4.x; future patches are not
covered.

| Current version | To 3.3.1                                                                               | To 3.4.0                                                                                                                    |
| --------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 3.0.x–3.2.x     | [Prediction setup or deferral](upgrades/3.3.1.md#3-first-time-or-deferred-integration) | [Prediction setup or deferral](upgrades/3.3.1.md#3-first-time-or-deferred-integration) → [Announcements](upgrades/3.4.0.md) |
| 3.3.0           | [Prediction upgrade options](upgrades/3.3.1.md#applicability)                          | [Prediction upgrade options](upgrades/3.3.1.md#applicability) → [Announcements](upgrades/3.4.0.md)                          |
| 3.3.1           | Already on target                                                                      | [Announcements](upgrades/3.4.0.md)                                                                                          |

For example, when upgrading from 3.3.0 to 3.4.0 with Prediction already integrated,
review the Prediction route migration first, then the announcement changes.
Without Prediction, follow the first-time integration or deferral path instead
of migrating routes that the app does not have.

Prediction is enabled by default; keep `features.prediction: false` until its
routes are ready, following the selected version guide's integration or deferral path.

## Feature integration guides

| Feature       | Complete integration guide                                                                               | Covers                                                                               |
| ------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Prediction    | [Prediction Integration Guide](../../packages/prediction/docs/integration-guide.md)                      | Pages, navigation, menus, and feature controls. Requires Prediction and i18n 3.3.1+. |
| Announcements | [Announcement integration and migration guide](../../packages/ui-notification/docs/integration-guide.md) | List/detail routes, sources, custom UI, and backend requirements for 3.4.0.          |

Default announcement bell, card, and View all links need working list/detail
destinations. A main-menu entry and a [custom mobile return bar](../../packages/ui-notification/docs/integration-guide.md#optional-mobile-return-bar)
are optional. A mobile sidebar entry is also optional; when adding one, append
it to the end of the mobile menu by default. Routes do not create menu entries.
Follow [announcement navigation entries](../../packages/ui-notification/docs/integration-guide.md#announcement-navigation-entries)
for the sidebar setup and preserving the bell in custom desktop navigation.

For a first-time announcement setup, follow the [integration checklist](../../packages/ui-notification/docs/integration-guide.md#first-time-integration-checklist)
and [framework route placement](../../packages/ui-notification/docs/integration-guide.md#framework-route-placement)
for Next.js, Remix, Vite, or a basename-aware router.

## Common upgrade rules

- **Declare direct dependencies.** Directly imported SDK packages must be declared
  even when installed transitively; see the feature guides' dependency requirements.
- **Align once to the final target.** Use the existing package manager and published
  constraints, then inspect the lockfile. Package versions can differ; preserve
  workspace ranges and later compatible versions rather than downgrading to examples.
- **Preserve host configuration.** Keep the existing provider/router structure,
  broker/network, locale prefixes or basename, remembered Perps symbols, and
  unrelated widget settings.
- **Respect SSR boundaries.** Keep shared route constants and server metadata free
  of client-only SDK imports.

These upgrade paths cover host integration with standard SDK pages and components.
Behavior already handled inside those components does not require additional host
implementation.

For other changes or custom hook/API integrations, consult the
[SDK release notes](https://orderly.network/docs/release-notes/sdk) and package API
references.

## AI Integration Workflow

Use this document as the entry point for implementing the user's requested
upgrade or feature integration in an existing target application. Read the linked guides before making
changes; this index alone does not contain the full integration instructions.
The target application and the SDK documentation may be in different repositories.
If the application or a required guide is inaccessible, report the missing access
and continue any independent checks; do not claim the integration is complete.

1. **Discover:** read the target app's repository instructions, initial Git
   changes, package metadata, and lockfile. Locate its framework, router and
   locale/basename handling, providers, navigation, feature settings, styles, and
   available verification scripts. Determine which features and legacy routes
   are already integrated. Make application changes in the target app, using this
   repository as the SDK reference.
2. **Select:** use the user's goal and the discovered app state to choose the
   [upgrade path](#choose-an-upgrade-path) or
   [feature integration guide](#feature-integration-guides). Read the applicable
   version and feature guides, including references needed for the chosen path.
   Follow their version selection rules and published dependency constraints;
   preserve compatible versions and do not treat example versions as fixed
   requirements. Preserve existing feature states and optional UI unless the
   requested integration requires changing them. Ask only for decisions that
   affect implementation and cannot be determined from the app or user
   instructions, including choices required by a feature guide such as the
   [Prediction menu arrangement](../../packages/prediction/docs/integration-guide.md#ai-integration-workflow).
3. **Implement:** complete the applicable integration steps within the user's
   requested scope, following the [common upgrade rules](#common-upgrade-rules).
   Reuse the existing provider tree, router, menus, and styles, preserving
   unrelated configuration and uncommitted work. On repeated runs, complete
   missing wiring without duplicating providers, routes, or menu entries. Align
   dependencies once to the final target using the app's existing package manager
   and update its lockfile; intermediate installs are unnecessary.
4. **Verify:** complete the selected guides' applicable acceptance checks, including
   the [Prediction checklist](../../packages/prediction/docs/integration-guide.md#5-verify-the-integration)
   or [announcement checklist](../../packages/ui-notification/docs/integration-guide.md#5-verify-the-integration)
   when relevant. Run the target app's supported typecheck, lint, build, and
   relevant tests. When the environment permits, verify browser navigation and
   actual backend behavior. Fix issues introduced by the integration and rerun
   the affected checks. If tools, backend capabilities, a wallet, or funds are
   unavailable, continue independent checks and record what remains unverified.
5. **Report:** list changed files, selected guides, target and resolved SDK
   versions, router mode, feature configuration, checks with outcomes, and
   remaining prerequisites. Report code integration and actual environment
   verification separately, including live trading checks when applicable. Mark
   either incomplete when required checks failed or could not run; never report
   an unexecuted check as passed.
