---
name: write-sdk-release-notes
description: Generate, revise, audit, or sanitize publication-ready public release notes for SDKs and libraries from Git diffs, package metadata, public APIs, documentation, issues, and supplied drafts. Use when compiling versioned SDK release notes, deciding what developer integrators need to know, identifying migrations or compatibility changes, checking semantic-versioning risk, or removing security-sensitive and internal implementation details before publication.
---

# Write SDK Release Notes

Publish the minimum verified technical detail developers need to integrate, upgrade, or diagnose an observable SDK problem.

Treat an existing release-note draft as unverified claims rather than source evidence. Apply the publication policy and use the release-note template included below.

## Workflow

1. Establish the release scope.
   - Identify the previous published version, target version, release date, release channel, affected packages, and published artifacts.
   - Inspect the release diff, package manifests, public exports and types, migration documentation, and relevant tests or issues.
   - Verify temporally unstable public metadata against the official repository, registry, or documentation.
   - Do not infer a version, date, package, API name, or link that cannot be verified.
   - Resolve tag, manifest, and registry discrepancies before drafting.

2. Build a private candidate inventory.
   - Record each change, affected package, evidence location, public-contract impact, required developer action, security sensitivity, and confidence.
   - Classify each candidate as `action-required`, `public`, `brief`, `omit`, or `restricted-security`.
   - Keep this inventory out of the publishable document.

3. Audit the public contract and semantic versioning.
   - Check removed or renamed APIs, newly required parameters, changed types or exports, changed defaults, initialization order, peer dependencies, runtime requirements, platform support, and network configuration.
   - Treat a newly required parameter or removed public API as a breaking change.
   - Flag breaking changes shipped in a patch or minor release. Require backward compatibility or a prominent migration notice; never describe such a release as having no breaking changes.
   - Give every deprecation a replacement and, when verified, a removal timeline.

4. Draft for developer integrators.
   - Name exact public methods, hooks, types, parameters, packages, and versions when developers must act.
   - Describe fixes using only the observable symptom and affected scenario. Do not narrate the previous unsafe behavior, causal timing window, internal data structure, or remediation mechanism unless it is part of the public contract.
   - Use one change per bullet and normally one or two sentences per change.
   - Put action-required changes first, followed by additions, behavior changes, fixes, compatibility, and known non-security limitations.
   - Make every action notice executable: name the affected package and public API, show the verified call or configuration shape, and link a canonical reference. If that is not possible, omit the notice from the public draft and report a blocker privately.
   - Link to public API or migration documentation instead of explaining internals.
   - Prefer one layered release note over duplicate short and detailed versions.

5. Apply the security disclosure gate.
   - Do not move restricted security details into the public document.
   - Treat descriptions of previous input interpretation, validation gaps, raw error forwarding, authorization timing, sanitization, or content execution as restricted candidates even when the source labels them as ordinary fixes.
   - If an approved critical upgrade notice is required, state only the affected public package, minimum acceptable version, and required action.
   - Hold publication when an unpatched issue or coordinated disclosure is unresolved.

6. Verify the draft.
   - Trace every public statement to release evidence.
   - Confirm API spelling, signatures, package scope, defaults, version numbers, dates, links, and migration examples.
   - Search for vulnerability details, exploit language, vulnerable paths or ranges, prior unsafe behavior, input interpretation, authorization timing, credentials, internal endpoints, audit findings, residual risks, pipeline details, and private issue links.
   - Remove placeholders and empty sections.
   - Exclude uncertain claims and report them separately as publication blockers.

7. Produce the result.
   - Return publication-ready Markdown first.
   - Put unresolved evidence, semantic-versioning concerns, and withheld security candidates in a clearly marked private editorial note or separate restricted file.
   - Never append private editorial content to the public release-note artifact.

## Output Standard

- List the newest release first.
- Include exact installation commands only when package names and versions are verified.
- Keep routine patch releases to a date and two to six precise bullets.
- Use an `Important` or `Action required` callout only when developers must act.
- Do not turn an internal initialization sequence into an integrator requirement when the standard public provider handles it automatically.
- Use `Bug fixes and internal improvements` only for low-impact work that does not merit a public detail.
- Preserve the user's requested language and established product terminology.

## Publication Policy

### Publication Test

Publish a detail only when at least one answer is yes:

1. Must an integrator change code or configuration?
2. Does it change runtime behavior, defaults, compatibility, supported environments, or network requirements?
3. Does it help an integrator recognize an observable SDK problem?
4. Does it identify a public capability developers can use?

Otherwise omit it or combine it under `Bug fixes and internal improvements`.

### Action Required

Give the exact public identifier, old and new behavior, required action, and verified migration link. Use for:

- Removed or renamed APIs
- Newly required parameters
- Meaningful type or event-contract changes
- Changed initialization requirements
- Minimum runtime, platform, browser, or peer-dependency changes
- Network or endpoint changes that affect configuration or allowlists
- Urgent upgrades approved for public disclosure

Do not publish a vague instruction such as `ensure the store is mounted` or `initialize configuration correctly`. Name the supported public provider, API, nesting order, or configuration field. If the standard SDK provider handles the internal sequence automatically, publish only the observable fix or omit it.

### Public

Name the public capability and developer outcome. Use for new methods, hooks, types, configuration fields, supported platforms, wallets, or chains.

### Brief

Describe only the observable symptom, scenario, and outcome:

- `Fixed an issue where deposits could fail immediately after token approval.`
- `Fixed an issue that could produce inconsistent order-book data during slippage calculations.`
- `Improved wallet initialization reliability across supported providers.`
- `Improved Affiliate FAQ content rendering.`

Do not explain polling, locks, retries, array mutation, hook dependencies, cache fallbacks, validation mechanics, or other implementation details unless they are part of the public contract.

Do not describe what a previous renderer interpreted or executed, why an authorization state was stale, which shared collection was mutated, or how a remediation closes a timing window. These details do not help routine integration and can expose unnecessary security or architecture information.

### Omit

Do not publish:

- Internal refactors, architecture, state-management, or rendering mechanics
- CI, release automation, notifications, credential controls, or environment variables
- Tests, logging, and diagnostics unless they change a public diagnostic contract
- Lockfile and development-dependency churn
- Internal ticket, commit, pipeline, or job links
- Tag or publishing mistakes; resolve them before publication
- Details that merely demonstrate engineering effort

### Compatibility And Dependency Changes

- Publish a dependency change when it alters a peer dependency, minimum supported runtime, bundle behavior, public type, installation resolution, or required integrator action.
- Omit routine direct or transitive dependency updates that install automatically and do not change the public contract.
- Publish an endpoint hostname only when an integrator may need to configure an allowlist, proxy, firewall, content-security policy, or custom provider.
- Identify affected package names when a monorepo change does not apply to every published package.

### Security Disclosure Gate

Default to omission. Do not publish:

- Non-public vulnerability existence or suspected exposure
- Vulnerability identifiers without explicit disclosure approval
- Exploit categories, prerequisites, reproduction steps, or affected code paths
- Vulnerable dependency names, ranges, or transitive chains
- Audit output, unresolved findings, or accepted residual risk
- Credential, control, or remediation implementation details
- Previous input-handling, content-execution, sanitization, or authorization behavior that is unnecessary for migration

If developers must upgrade to remain protected, require release-owner or security-owner approval. State only the required action and minimum acceptable version:

`Upgrade @scope/package to vX.Y.Z or later. Earlier versions are no longer recommended for production use.`

Link an approved public advisory rather than reproducing it. Never claim that a release is secure or that all risk is resolved without evidence.

Security filtering must not conceal an integration-breaking change. Document the required API or behavior migration without explaining a restricted reason for it.

### Writing Patterns

- `Added ApiName to support outcome.`
- `Deprecated OldApi; migrate to NewApi.`
- `Changed DefaultName from A to B. Existing saved settings are preserved.`
- `Fixed an issue where symptom could occur when scenario.`
- `The minimum supported Platform version is now X, up from Y.`

Prefer exact public identifiers and observable outcomes. Avoid implementation narration, commit-message language, vague promotional claims, and duplicated summaries.

For replacement APIs, list request fields or signatures only when verified and required to migrate. Otherwise name the old API, replacement API, and migration action, then link the public reference.

### Publication Checklist

- Verify release date, version, channel, packages, and artifact availability.
- Verify every public API name and changed default against source.
- Put all required developer actions before optional updates.
- Confirm breaking changes follow semantic versioning or carry an explicit migration notice.
- Confirm all links are public and canonical.
- Confirm the document contains no private editorial notes or security-review material.
- Confirm every fix stops after the observable symptom and scenario; remove causal sequencing and former unsafe behavior.
- Confirm concise and detailed sections do not disclose different information.
- Remove every placeholder and empty section.

## Release Notes Template

Fill the following structure and remove every empty or unverified section:

````markdown
# {{SDK name}} release notes

## Latest update

| Release date | Stable release      | Release candidate           |
| ------------ | ------------------- | --------------------------- |
| {{date}}     | {{version or link}} | {{version, link, or blank}} |

## Install or upgrade

```sh
{{verified installation or upgrade command}}
```

## Version {{version}}

_{{release date}}_

This version includes the following updates:

> [!IMPORTANT]
> **Action required:** {{required developer action}}

- {{Added or changed public capability.}}
- {{Observable bug fix and affected scenario.}}
- {{Compatibility or changed-default detail.}}

> [!NOTE]
> {{Known non-security limitation or availability note.}}

[API reference]({{public API URL}}) | [Migration guide]({{public migration URL}}) | [Package]({{public package URL}})
````
