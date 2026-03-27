---
name: docsgenerate
description: Automatically scan code directories and generate or update structured Markdown documentation (index + detail) for Dart, Rust, TypeScript, JavaScript, React/Next.js and more. Use when you need to create or incrementally update API/type/component docs directly from source code.
---

# Docs Generation Skill (based on @docsgenerate.md)

This skill is used to **create, update, and manage code documentation** inside a repository by following the workflow defined in `@docsgenerate.md`:

- Scan a target code directory
- Detect language and analyze code structure
- Generate index and detail documentation under a `docs/` folder
- Support both **sync** (full) and **update** (incremental) modes

---

## I. Overview

- **Goal**: Automatically generate structured Markdown documentation from code, and keep it in sync with ongoing changes.
- **Typical use cases**:
  - First-time generation of API/type/component docs for a module or service
  - Keeping docs up to date based on `git diff`
  - Ensuring the docs directory mirrors the code directory structure
- **Supported source languages**: Dart, Rust, TypeScript, JavaScript, JSX, TSX, React, Next.js, etc.
- **Docs language**: default **English (EN)** for all generated documentation, unless the user explicitly asks for another language (for example, Chinese).
- **Output location**:
  - By default, a `docs/` directory at the **same level** as the source directory (e.g. `xxxx/abc/src` → `xxxx/abc/docs`).
  - If the user explicitly provides an **output directory**, generate all documentation under that directory instead.

---

## II. Outline

1. When to use & prerequisites
2. Parameters and modes
3. Standard execution flow
   - 3.1 Validate parameters
   - 3.2 Scan directory & detect language
   - 3.3 Handle `update` mode via git diff
   - 3.4 Parse code & understand semantics
   - 3.5 Generate documentation content (index + detail)
   - 3.6 Write into the `docs/` tree
4. Documentation structure conventions
   - 4.1 Directory and file layout
   - 4.2 Index document conventions
   - 4.3 Detail document conventions (by language)
5. Usage examples
6. Feature introduce / TASK-scoped docs (subAgent)
7. Recommendations and caveats

---

## III. Detailed Instructions

### 1. When to Use & Prerequisites

Trigger this skill when:

- The user asks to “generate code docs”, “update API docs”, or “generate docs from code”, etc.
- There is already a partial `docs/` tree and it needs to be synced with code changes.
- The user explicitly mentions `docsgenerate`, `@docsgenerate.md`, or wants to reuse that command’s behavior.

Prerequisites:

- The current working directory is the repository root or a relevant subdirectory.
- The target code directory path is valid and reachable (relative or absolute).

### 2. Parameters and Modes

This skill assumes two explicit parameters, plus implicit preferences for docs language and output directory:

1. **Parameter 1: `path` (required)**
   - Meaning: the code directory to scan.
   - Forms:
     - Relative: `packages/orderly_types/lib/api`
     - Absolute: `/Users/.../packages/orderly_types/lib/api`

2. **Parameter 2: `mode` (optional)**
   - `sync` (default): full generation/overwrite based on current code.
   - `update`: incremental update based on `git diff`, only touching affected docs.
   - If omitted, treat as `sync`.

3. **Docs language (implicit, optional)**
   - Default output language is **English**.
   - If the user explicitly requests another language (e.g. “generate Chinese docs”, “文档使用中文”), generate all Markdown content in that language instead.
   - Keep code identifiers (types, props, function names, file paths) in their original source language; only translate explanatory text, headings, and table descriptions.

4. **Output directory (implicit or explicit, optional)**
   - **Default**: if the user only provides a source directory (for example `xxxx/abc/src`), use a sibling `docs` directory as the docs root (for example `xxxx/abc/docs`).
   - **Override**: if the user explicitly provides an output path (for example “output `xxxx/abc/docs`”), use that path as the docs root instead of the default `../docs`.
   - For relative output paths, keep the same convention as `path` (typically relative to the repo root or current working directory).

### 3. Standard Execution Flow

#### 3.1 Validate Parameters

- Check that `path` exists and is a directory.
  - If it does not exist, surface a clear error and exit the docs task.
- Determine mode:
  - Empty or `sync` → **full generation**
  - `update` → **incremental update**

#### 3.2 Scan Directory & Detect Language

- Recursively walk `path` and collect files with:
  - `.dart`, `.rs`, `.ts`, `.tsx`, `.js`, `.jsx`, etc.
- Use file extension as the primary language signal.
- If the extension is ambiguous, use code patterns, for example:
  - `@freezed`, `abstract class` → Dart
  - `pub struct`, `impl` → Rust
  - `export`, `interface`, `type` → TypeScript
  - `import React`, `function Component` → React/JSX

#### 3.3 Handle `update` Mode via git diff

Only in `mode = update`:

- Run `git diff --name-only HEAD` to get changed files.
- Filter the list to files under `path` and in supported languages.
- Map changed files to docs that must be updated:
  - The file’s own detail doc
  - The directory’s `index.md`
  - The root `docs/index.md`

#### 3.4 Parse Code & Understand Semantics

For each file to process (sync: all files; update: changed files only):

1. Read file contents.
2. Apply language-specific parsing strategies:
   - **Dart**: detect `@freezed`, `abstract class`, `const factory`, `fromJson`, etc.
   - **Rust**: detect `pub struct`, `pub enum`, `impl`, `#[serde(...)]`, etc.
   - **TypeScript/JS**: detect `export`, `interface`, `type`, `class`, `function`, etc.
   - **React/JSX/TSX**: detect components, Props definitions, hooks, and JSX structure.
3. Extract documentation-ready information:
   - Type/component/function names and descriptions
   - Field/parameter lists and types
   - Important comments (JSDoc/doc comments)
   - Typical usage patterns

#### 3.5 Generate Documentation Content

Use a two-layer structure: **index docs + detail docs**.

1. **Index docs (`index.md`)**:
   - Root index: lists all subdirectories and top-level files with short descriptions.
   - Subdirectory index: lists files and subdirectories in that folder, with language and short function summaries.

2. **Detail docs (language-specific)**:
   - **Dart files**:
     - Overview, type list, field tables (field name, type, required, JSON key, description)
     - Factory methods like `fromJson`/`toJson`
     - Example usage code
   - **Rust files**:
     - Struct/enum overviews, field tables, method descriptions
     - Important derives (e.g. `Serialize`, `Deserialize`)
     - Usage examples (construction, serialization/deserialization)
   - **TypeScript/JavaScript files**:
     - Exported interfaces/types/functions/classes
     - Parameters and returns
     - Example usage snippets
   - **React/JSX/TSX files**:
     - Component overview
     - Props table (name, type, required, default, description)
     - JSX usage example
     - Key hooks and behavior notes

#### 3.6 Write into the `docs/` Tree

- Resolve the **docs root directory**:
  - If the user has provided an explicit output directory, use that as the root and create it if necessary.
  - Otherwise, derive a default docs root at the same level as `path` named `docs` (for example `xxxx/abc/src` → `xxxx/abc/docs`) and create it if necessary.
- Under the resolved docs root, mirror the code structure:
  - `{docsRoot}/index.md`
  - `{docsRoot}/{subdir}/index.md`
  - `{docsRoot}/{subdir}/{filename}.md`
- In `sync` mode, rewrite all relevant docs.
- In `update` mode, rewrite only docs linked to changed files and their indexes.

---

## IV. Documentation Structure Conventions

### 4.1 Directory & File Layout

Example code tree:

```text
lib/
  account/
    account.dart
    asset.dart
  api/
    general.rs
    rewards.tsx
```

Corresponding docs tree:

```text
docs/
  index.md                    # root index
  account/
    index.md                  # account directory index
    account.md                # detail for account.dart
    asset.md                  # detail for asset.dart
  api/
    index.md                  # api directory index
    general.md                # detail for general.rs
    rewards.md                # detail for rewards.tsx
```

### 4.2 Index Document Conventions

**Root index `docs/index.md` should include:**

- High-level overview of the module/directory
- List of first-level subdirectories with links
- List of top-level code files (file name, language, short description, link)

**Subdirectory index `docs/{dir}/index.md` should include:**

- Description of the directory’s responsibility
- List of code files in this directory:
  - File name
  - Language (Dart/Rust/TS/JS/React, etc.)
  - 1–2 sentence summary
  - Link to the detail doc
- Links to subdirectories (if any) for navigation

### 4.3 Detail Document Conventions (Example Structures)

#### Dart File Example Structure

````markdown
# {filename}

## Overview

Short description of what this file does.

## Types

### {ClassName}

Description of the class responsibility.

#### Fields

| Field | Type | Required | JSON Key | Description |
| ----- | ---- | -------- | -------- | ----------- |
| ...   | ...  | ...      | ...      | ...         |

## Usage Example

```dart
// Example usage
final model = {ClassName}.fromJson({...});
```
````

````

#### Rust File Example Structure

```markdown
# {filename}

## Overview

Short description of what this file does.

## Structs and Enums

### {StructName}

Struct description.

#### Fields

| Field | Type | Description |
| ----- | ---- | ----------- |
| ...   | ...  | ...         |

## Usage Example

```rust
// Example code
let v = {StructName} { /* fields */ };
````

````

#### TypeScript/React File Example Structure (Generic)

```markdown
# {filename}

## Overview

Description of what this file exports and how it is used.

## Exports

### Interfaces / Types

- Explain purposes and key fields.

### Components (if any)

#### Props

| Name | Type | Required | Default | Description |
| ---- | ---- | -------- | ------- | ----------- |
| ...  | ...  | ...      | ...     | ...         |

## Usage Example

```tsx
// Example component usage
<{ComponentName} prop1={...} />
````

````

#### React UI Component / Preset Structure (UI docs-style)

For UI components and presets similar to `packages/ui/doc`, prefer a richer structure:

```markdown
# {ComponentOrPresetName}

> Location: `packages/ui/src/...`, `packages/ui/src/...`

## Overview

High-level explanation of what this component or preset does and when to use it.

## Files

| File                | Description                             |
| ------------------- | --------------------------------------- |
| `path/to/file.tsx`  | What lives here and how it is used.     |

## Props / Types

```ts
export type {ComponentName}Props = {
  // ...
};
````

- Bullet-point explanation of each important prop or field.

## UI Behavior

Numbered list explaining state, layout, responsive behavior, locale integration, etc.

## Implementation Notes

Important wiring details (e.g. how it uses a modal manager, context providers, hooks).

## Usage

```tsx
import { {ComponentName} } from "@orderly.network/ui";

function Example() {
  return <{ComponentName} /* props */ />;
}
```

- Notes about the returned promise, callbacks, or composition patterns.

## Tips

1. Customization tips (variants, slots, classNames).
2. Localization notes.
3. Composition patterns (chaining calls, error handling, etc.).

````

---

## V. Usage Examples

> The following examples assume you are at the repo root and want to generate or update docs for specific modules.

1. **First-time full docs for a Dart API directory (default sync mode)**

```bash
@docsgenerate.md packages/orderly_types/lib/api
````

2. **Explicitly run sync mode to fully regenerate**

```bash
@docsgenerate.md packages/orderly_types/lib/api sync
```

3. **Generate docs for a Rust API directory**

```bash
@docsgenerate.md packages/orderly_utils/rust/src/api sync
```

4. **Generate docs for a React/Next.js components directory**

```bash
@docsgenerate.md apps/woofi_pro/lib/components sync
```

5. **Incrementally update docs based on current changes (update mode)**

```bash
@docsgenerate.md packages/orderly_types/lib/api update
```

---

## VI. Feature introduce docs & one-TASK-per-subAgent

Use this when the user (or a **Cursor plan**) targets `**/docs/featureIntroduce/**` or any doc set keyed by stable **`TASK-*` IDs** (96 tasks: six order types × margin × side × `NONE`/`TP_ONLY`/`SL_ONLY`/`TP_AND_SL`). **LIMIT/MARKET** implement opening bracket TP/SL in hooks; **STOP\_\*, SCALED, TRAILING_STOP** share the same TP/SL column for matrix parity but `canSetTPSLPrice` blocks bracket fields — see generated **step 9** in those docs.

### Orchestrator (main agent)

- Keep an explicit queue of **one Task ID per unit of work**.
- For **each** `TASK-...`, spawn a **Cursor `Task` subagent** with a single-task brief: Task ID, margin / side / TP·SL variant (or `NA`), target file path, required YAML frontmatter rules for that file, links to relevant Creators / `useOrderEntry` / `ui-order-entry`.
- Merge the subagent’s Markdown into the right `order-*.md` or matrix file; verify anchors, cross-links, and full coverage of the planned task list.

### Subagent (one invocation = one `TASK-*`)

- Output **only** that task’s section (e.g. under `## TASK-MARKET-CROSS-SELL-NONE`): scenario summary table, payload fields, numbered UI steps, selector quick reference.
- Do **not** draft other Task IDs in the same turn.
- Body text in **English** unless the user overrides; keep identifiers, paths, and `data-testid` strings verbatim from source.

This complements the default code-scan workflow (Sections III–V): featureIntroduce work is **task-scoped narrative docs**, not file-per-export API docs.

---

## VII. Recommendations & Caveats

- `sync` mode **rebuilds docs from scratch** based on current code—best for:
  - Initial generation
  - Stale docs that need a full refresh
- `update` mode only touches docs related to files in `git diff`—best for:
  - Frequent small iterations, saving time and context
- Keep language detection accurate:
  - Prefer standard file extensions
  - For mixed or special cases, clarify behavior in the docs if needed
- Doc file names should mirror code file names (only extension changed to `.md`) so it is easy to jump from docs back to code.
- It is recommended to integrate a `sync` or `update` run into PR or release workflows to keep code and docs aligned.
