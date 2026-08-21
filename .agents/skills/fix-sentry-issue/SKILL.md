---
name: fix-sentry-issue
description: Given a Sentry issue URL (direct or Slack), fetches details via MCP, analyzes root cause against the current repo code, and generates code fix suggestions. Use when the user provides a Sentry issue link or URL to investigate and fix.
---

# Fix Sentry Issue from URL

Given a Sentry issue URL provided by the user, fetch details, analyze root cause, and produce concrete code fix suggestions within the current repository.

## When to Use

- User provides a Sentry issue link (direct link or link opened from Slack)
- User wants root cause analysis and code-level fix recommendations for the issue

## URL Formats

Two formats are supported. **Pass the full URL directly to the MCP tool**; no parsing is required:

- **Direct link**: `https://{org}.sentry.io/issues/{id}?project=...`
- **Slack link** (with query params): `https://{org}.sentry.io/issues/{id}/?alert_rule_id=...&project=...&referrer=slack`

If parsing fails in some environments, extract from URL: `https://{org}.sentry.io/issues/{issueId}` → `organizationSlug` is `{org}`, used for calls like `mcp_Sentry_get_trace_details`.

---

## Phase 1: Fetch Details

1. Call **`mcp_Sentry_get_issue_details`** with `issueUrl` = the full URL provided by the user.
2. Extract from the response: exception type/message, stack trace, file paths, line numbers, breadcrumbs, request/context.
3. **Trace (optional)**: If trace info is present in the response:
   - Get `traceId` from `event.contexts.trace.trace_id` (must be a 32-character hex string).
   - Parse `organizationSlug` from the URL (e.g. `orderly-network-zt.sentry.io` → `orderly-network-zt`).
   - Call **`mcp_Sentry_get_trace_details`** (`organizationSlug`, `traceId`) for trace context.
4. **Tag distribution (optional)**: When you need impact scope, call **`mcp_Sentry_get_issue_tag_values`** with `issueUrl` and `tagKey` (e.g. `url`, `environment`) to inspect distribution.

---

## Phase 2: Root Cause Analysis (Based on Repository Code)

1. Use the stack trace, file paths, line numbers, breadcrumbs, etc. from Phase 1 to locate relevant files in the **current workspace**.
2. Use `Grep`, `SemanticSearch`, `Read`, and similar tools to inspect the related code.
3. Combine exception type, error message, context, and local code logic to analyze root cause and draw conclusions.

---

## Phase 3: Code Fix Suggestions

1. From the root cause analysis, identify the exact locations that need changes in the current repository.
2. Produce concrete modification plans: file paths, change points, and code diff or pseudocode.

---

## MCP Tools Quick Reference

| Step         | Tool                              | Parameters                                                    |
| ------------ | --------------------------------- | ------------------------------------------------------------- |
| Details      | `mcp_Sentry_get_issue_details`    | `issueUrl`: full URL provided by user                         |
| Trace (opt.) | `mcp_Sentry_get_trace_details`    | `organizationSlug` (from URL), `traceId` (from issue details) |
| Tag dist.    | `mcp_Sentry_get_issue_tag_values` | `issueUrl`, `tagKey` (e.g. `url`, `environment`)              |

---

## Output Template

Use the following structure for the report:

```markdown
## Sentry Issue Analysis Report

### Basic Info

- Issue: [ID/URL]
- Error type: [type]
- First/Last occurred: [dates]

### Root Cause Analysis

[Conclusion based on stack trace, breadcrumbs, and repository code + supporting evidence]

### Code Fix Suggestions

| File   | Changes       | Priority |
| ------ | ------------- | -------- |
| [path] | [description] | P0/P1/P2 |

### Specific Changes

[Code block or diff]
```
