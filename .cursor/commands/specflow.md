---
name: specflow
description: Manage SpecFlow workflow tasks - create tasks, view status, advance workflow, approve/reject nodes, rollback, list tasks, and archive tasks. Use this skill to manage the R&D workflow including requirement analysis, UX design, technical design, code implementation and other stages. When users mention workflow, task management, task status, advance task, review task, archive task or related operations, use this skill.
argument-hint: <action> [taskId_or_url] [--node <nodeId>] [--title <title>]
allowed-tools: Bash, Glob, Grep, Read, Write, Task, AskUserQuestion
---

# SpecFlow Workflow Management

Use **specflow-task** Skill as the core orchestration layer for all operations.

## Total Context

- **SpecFlow** is the R&D workflow: requirement analysis → UX design → technical design → test/implementation → summary.
- **Flow is automatic**: each step is based on **the previous step's output**: review → score → **automatically decide** whether to advance to the next step (or revise/reject). Steps are not manually advanced; the coordinator drives this loop. After **create** or **start**, the workflow automatically enters the first node (no manual first `advance` needed).
- **Step definitions** are the single source of truth in **`.specflow/workflows/*.yaml`** (e.g. `standard.yaml` loaded by `workflowId`). Node order, review rules, score thresholds, and auto-advance behaviour are defined there—not in this document.
- **specflow-task** coordinates by reading the workflow YAML: execute current node (input = previous step output) → review previous output → score → if score ≥ threshold, auto-advance to next node; otherwise do not advance (blocked/revise).

## Prerequisites

- **Atlassian MCP** (conditionally required): only needed when `start` is called with a JIRA issue ID or URL. If MCP is not configured and a JIRA URL is provided, stop and prompt the user to configure Atlassian MCP first.
- **Workflow file**: `.specflow/workflows/{workflowId}.yaml` must exist before any operation. If missing, list available workflows and abort.

## Supported Actions

### 1. Create Task (create)

Create a new task manually (for tasks **NOT** in JIRA):

```
/specflow create DEX-2800 --title "Add position summary feature to trading page"
```

**Parameters:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| taskId | Yes | Task ID (e.g., DEX-2800) |
| --title | Yes | Task title |
| --figma | No | Figma design URLs (comma-separated) |
| --workflow | No | Workflow ID; if omitted, resolved from `config.yaml` or auto-selected (see **workflowId Resolution** below) |

**workflowId Resolution (create/start):**

1. If `--workflow` is provided → validate `.specflow/workflows/{workflowId}.yaml` exists; abort with list of available workflows if not.
2. If omitted and `config.yaml` has `workflow.defaultId` → validate the corresponding YAML exists and use it silently.
3. If omitted and **only one** `.yaml` exists in `.specflow/workflows/` → use it silently.
4. If omitted and **multiple** `.yaml` files exist → list them with descriptions and prompt user to choose (default: `standard` if present).

The selected `workflowId` is written into `state.json` and permanently bound to this task. All subsequent operations read it from there — the user is never asked again.

**Behavior:**

- If `.specflow/specs/{taskId}/state.json` already exists, show the current state and ask whether to force restart. If the user confirms, the entire `.specflow/specs/{taskId}/` directory is deleted before reinitializing; otherwise the operation is aborted.
- Resolves `owner` from `git config user.email`; falls back to `"agent"` if unavailable.
- Creates `.specflow/specs/{taskId}/` directory, then writes `state.json` from `templates/state-tpl.json`.
- **After state is written, automatically executes the first node** from the workflow YAML (Generate → Review → Gate for that node). No separate `advance` is required to start the first node.

### 2. Start Task (start)

Start a task from a JIRA issue. Automatically fetches ticket details via Atlassian MCP and initializes the workflow:

```
/specflow start DEX-2800
```

Or simply use taskId alone (implies start from JIRA):

```
/specflow DEX-2800
```

You can also paste the full JIRA URL — the issue ID will be extracted automatically:

```
/specflow start https://orderly-network.atlassian.net/browse/DEX-1646
```

```
/specflow https://orderly-network.atlassian.net/browse/DEX-1646
```

**Parameters:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| taskId_or_url | Yes | JIRA issue ID (e.g., DEX-2800) OR full JIRA URL. The issue ID is automatically extracted from the URL. |
| --figma | No | Figma design URLs (comma-separated) |
| --workflow | No | Workflow ID; if omitted, resolved from `config.yaml` or auto-selected (same resolution rules as `create`) |

**URL Parsing Logic:**

- If input contains `atlassian.net/browse/`, extract the issue key from the URL path and use it as both `taskId` and `jiraIssueUrl`.
- Example: `https://orderly-network.atlassian.net/browse/DEX-1646` → `taskId = DEX-1646`, `jiraIssueUrl = https://...`

**Behavior:**

- Calls Atlassian MCP to fetch issue details (summary, description, type, status, assignee) and caches the result in `jiraIssueData` inside `state.json`.
- Subsequent sub-skills read `jiraIssueData` directly from `state.json` — MCP is not called again.
- If `.specflow/specs/{taskId}/state.json` already exists, show the current state and ask whether to force restart. If the user confirms, the entire `.specflow/specs/{taskId}/` directory is deleted before reinitializing; otherwise the operation is aborted.
- Resolves `owner` from `git config user.email`; falls back to `"agent"` if unavailable.
- **After state is written, automatically executes the first node** from the workflow YAML (Generate → Review → Gate for that node). No separate `advance` is required to start the first node.

### 3. View Status (status)

View a specific task's workflow status:

```
/specflow status DEX-2800
```

View all tasks:

```
/specflow status
```

**Output includes:** current node, each node's completion state and review score, recent history.

### 4. Advance Workflow (advance)

Advance to the next node (determined by workflow YAML order):

```
/specflow advance DEX-2800
```

Advance to a specific node (skip intermediate nodes — requires user confirmation):

```
/specflow advance DEX-2800 --node ux-design
```

> ⚠️ Skipping nodes is a destructive operation. The user must explicitly confirm before proceeding.

**Parameters:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| taskId | Yes | Task ID |
| --node | No | Target node ID (e.g., `ux-design`, `tech-design`). Omit to advance to the next node in sequence. |

### 5. Review Node (review)

Review the current node's output and get a scored report:

```
/specflow review DEX-2800
```

**Output includes:** score (0–100), pass/fail against gate threshold, per-item review findings, suggested fixes.

### 6. Approve Node (approve)

Approve the current node and advance to the next:

```
/specflow approve DEX-2800
```

Updates `nodeOutputs[activeNodeId].output.action` to `approve`, advances `activeNodeId` to the next node, and appends a `history` entry.

### 7. Request Revision (revise)

Reject the current node and request revision:

```
/specflow revise DEX-2800 --reason "H5 adaptation is not described in section 3"
```

**Parameters:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| taskId | Yes | Task ID |
| --reason | Yes | Reason for rejection |

Sets `status` to `blocked`, records `action: reject` with the reason in `history`.

### 8. Rollback (rollback)

Roll back to a previous node:

```
/specflow rollback DEX-2800 --node req-analysis
```

> ⚠️ Rollback clears all `nodeOutputs` for the target node and every node after it. The user must explicitly confirm before proceeding.

**Parameters:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| taskId | Yes | Task ID |
| --node | Yes | Target node ID to roll back to |

### 9. List Tasks (list)

List all tasks:

```
/specflow list
```

With filter:

```
/specflow list --filter in_progress
/specflow list --filter my
/specflow list --filter completed
```

**Parameters:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| --filter | No | Filter: `in_progress`, `my`, `completed`, `all` (default: `all`) |

### 10. Archive (archive)

Move a task's spec directory into the archived folder. Requires a clean git working tree (no uncommitted changes) before archiving:

```
/specflow archive DEX-2800
```

**Parameters:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| taskId | Yes | Task ID (e.g., DEX-2800) |

**Behavior:**

1. Validate task exists at `.specflow/specs/{taskId}/`.
2. Run `git status --porcelain`; if output is non-empty → abort with message to commit or stash first.
3. Create `.specflow/archived/` if it does not exist.
4. Move `.specflow/specs/{taskId}/` to `.specflow/archived/{taskId}/`.
5. Output success message.

> Archive does **not** go through specflow-task Skill; it is a direct filesystem + git operation.

### 11. Help (help)

Show help message:

```
/specflow help
```

---

## Execution Steps

Prompt files use the `<execution_context>` tag to declare required reference files (e.g. `@.specflow/prompts/doc-generation-base.md`). The caller must load these files into context before invoking the skill.

1. **Read** `.specflow/config.yaml` (if it exists) to load project-level defaults (`workflow.defaultId`, `project.jiraBaseUrl`, `project.jiraProjectKey`, `task.defaultOwner`). If the file does not exist, skip silently and use system defaults.
2. **Read** `.claude/skills/specflow-task/SKILL.md` to load workflow semantics, orchestration logic, and state management rules.
3. Parse the action type from user input (`create` / `start` / `status` / `advance` / `review` / `approve` / `revise` / `rollback` / `list` / `archive` / `help`).
4. Extract `taskId` and all related parameters. If input is a bare JIRA URL, treat as `start`. If input is a bare taskId (e.g. `DEX-2800`) and `config.yaml` has `project.jiraBaseUrl` + `project.jiraProjectKey`, auto-expand to full Jira URL for MCP calls.
5. **Determine workflowId** (two-phase rule):
   - **create / start**: `--workflow` flag → `config.yaml` `workflow.defaultId` → single YAML auto-select → prompt user. Write chosen value into `state.json`.
   - **All other operations** (except `archive`): read `workflowId` directly from `.specflow/specs/{taskId}/state.json` — never ask the user again.
6. **Execute** the operation:
   - **archive**: Direct execution (does not use specflow-task). Validate `.specflow/specs/{taskId}/` exists → run `git status --porcelain` → if non-empty, abort with `git status` summary and prompt to commit/stash; otherwise create `.specflow/archived/` if missing → move `specs/{taskId}/` to `archived/{taskId}/` → output success.
   - **All other actions** via **specflow-task**:
     - Loads `.specflow/workflows/{workflowId}.yaml` for node order, skill mappings, review rules, and gate thresholds.
     - For `start`/`create`: runs the full state initialization flow (conflict check → mkdir → resolve owner → fetch Jira via MCP if applicable → fill `state-tpl.json` → write `state.json`). **Then, if the workflow has at least one node, immediately executes the first node** (same as one advance cycle: Generate → Review → Gate). If the first node is type `gate`, stop and wait for user decision; if type `document`, run generate → review → gate; if that node passes and `autoAdvanceOnPass` is true, continue to the next node(s) per the advance logic in specflow-task SKILL.
     - For `advance`: runs current node skill → reviews previous output → scores → auto-advances if gate passes; otherwise blocks.
     - For `approve`/`revise`/`rollback`: updates `state.json` accordingly and appends `history`.
7. Return formatted results to the user.

## State File

Workflow state is stored at:

```
.specflow/specs/{taskId}/state.json
```

Initialized from `templates/state-tpl.json` in the **specflow-task** skill. See **specflow-task** SKILL.md for the full placeholder resolution rules and field schema.

## Workflow Nodes

Node order, types, review rules, and pass thresholds are defined in **`.specflow/workflows/{workflowId}.yaml`** (e.g. `standard.yaml`). **specflow-task** reads that file and executes the steps; node lists and thresholds are never duplicated here. See **specflow-task** SKILL.md for how the coordinator interprets the YAML.

**Node types**: `document` (doc generation + doc review), `impl` (code implementation), `code-review` (code review of impl output), `gate` (manual approve/reject). The **standard** workflow inserts a `code-review` node between `impl` and `summary`; when advance reaches `code-review`, it skips Generate and directly runs `specflow-code-review` on impl output, then Gate.

## Error Handling

| Situation                                 | Behavior                                                                                                           |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| taskId not found                          | Show error with path checked; suggest `/specflow list`                                                             |
| Workflow YAML missing                     | List available files in `.specflow/workflows/`; abort                                                              |
| Atlassian MCP not configured              | Abort `start`; prompt user to configure MCP or use `create` instead                                                |
| Task already exists                       | Show current state; ask whether to force restart; if confirmed, delete directory and reinitialize; otherwise abort |
| Advance blocked (score < threshold)       | Explain score, list specific issues, suggest fixes                                                                 |
| Invalid action                            | Show usage help                                                                                                    |
| Skip-node / rollback without confirmation | Prompt for explicit confirmation before proceeding                                                                 |
| Git has uncommitted changes (archive)     | Abort; show `git status` summary; prompt user to commit or stash before archiving                                  |

---

## Examples

```bash
# Create a new task manually (not from JIRA)
/specflow create DEX-2800 --title "Add position summary feature"

# Create with Figma links and custom workflow
/specflow create DEX-2800 --title "Redesign profile page" --figma "https://figma.com/file/xxx" --workflow ui

# Start a task from JIRA issue ID (auto-fetches ticket details via MCP)
/specflow start DEX-2800

# Or simply use taskId alone (implies start from JIRA)
/specflow DEX-2800

# Start from full JIRA URL (issue ID is extracted automatically)
/specflow start https://orderly-network.atlassian.net/browse/DEX-1646
/specflow https://orderly-network.atlassian.net/browse/DEX-1646

# Check task status
/specflow status DEX-2800

# View all tasks
/specflow status

# Advance to next node
/specflow advance DEX-2800

# Advance to a specific node (skip intermediate — requires confirmation)
/specflow advance DEX-2800 --node ux-design

# Review current node
/specflow review DEX-2800

# Approve current node
/specflow approve DEX-2800

# Request revision with reason
/specflow revise DEX-2800 --reason "Section 3 is missing H5 adaptation description"

# Roll back to a previous node (requires confirmation)
/specflow rollback DEX-2800 --node req-analysis

# List all tasks
/specflow list

# Filter by status
/specflow list --filter in_progress
/specflow list --filter my
/specflow list --filter completed

# Archive a completed task (requires clean git)
/specflow archive DEX-2800
```
