# Documentation Generation Command

**Role**: Code documentation generation assistant  
**Context**: Scan specified code directories (supports Dart, Rust, TypeScript, JavaScript, JSX, TSX, Next.js, etc.), automatically detect language types, and generate structured Markdown documentation  
**Scope**: Supports both full generation and incremental update modes; language type is inferred from file extension and code characteristics

---

## 🚀 Overview

This command automatically scans code directories and generates structured Markdown documentation for multiple programming languages:

- **Automatic language detection**: Language type is inferred from file extension and code characteristics
- **Structured output**: Generates index files and detailed docs, preserving directory structure mapping
- **Two modes**:
  - **sync** (default): Regenerate all documentation from the current codebase
  - **update**: Incremental update based on git diff
- **Multi-language support**: Dart, Rust, TypeScript, JavaScript, JSX, TSX, Next.js, etc.

---

## 📋 Parameters

### Parameter 1 (required): path – Directory path

Path to the code directory to scan. Relative and absolute paths are supported.

**Examples**:

- `packages/orderly_types/lib/api`
- `packages/orderly_utils/rust/src/api`
- `apps/woofi_pro/lib/components`

### Parameter 2 (optional): Operation mode

- **`sync`** (default): Regenerate all documentation from the codebase
- **`update`**: Update only documentation for files changed in the current git diff

**Note**: If the second parameter is omitted, `sync` mode is used.

---

## 📁 Document structure mapping

Input directory structure:

```
lib/
  account/
    account.dart
    asset.dart
  api/
    general.rs
    rewards.tsx
```

Output documentation structure (a sibling `docs/` directory is created):

```
docs/
  index.md                    # Root index
  account/
    index.md                  # account directory index
    account.md                # account.dart detailed doc
    asset.md                  # asset.dart detailed doc
  api/
    index.md                  # api directory index
    general.md                # general.rs detailed doc
    rewards.md                # rewards.tsx detailed doc
```

---

## 🎯 Execution steps

### Step 1: Validate parameters

1. Verify that the first parameter (directory path `path`) exists
2. If the directory does not exist, report an error and exit
3. Check the second parameter: if missing or `sync`, use sync mode; if `update`, use update mode

### Step 2: Scan directory structure

1. Use `list_dir` and `glob_file_search` to recursively scan the target directory
2. Find all code files (e.g. `.dart`, `.rs`, `.ts`, `.tsx`, `.js`, `.jsx`)
3. Infer language type from file extension
4. Build a directory structure map, recording for each file:
   - Relative path
   - Language type
   - Directory level

### Step 3: Handle update mode (when the second parameter is `update`)

1. Run `git diff --name-only HEAD` via `run_terminal_cmd` to get the list of changed files
2. Filter to code files under the target directory
3. Infer language type for changed files
4. Determine which documentation files need to be updated (including related index files)

**Note**: If the second parameter is `sync` or omitted, skip this step and process all files.

### Step 4: Read and analyze code files

For each file to process (sync mode: all files; update mode: changed files only):

1. Use `read_file` to read file contents
2. **Language detection**:
   - Determine language from file extension
   - If extension is ambiguous, use code heuristics:
     - `@freezed`, `abstract class` → Dart
     - `pub struct`, `impl`, `#![derive]` → Rust
     - `export`, `interface`, `type` → TypeScript
     - `import React`, `function Component` → React/JSX
3. **Code analysis** (strategy depends on language):
   - **Dart**: Analyze `@freezed` classes, fields, `fromJson` methods, doc comments
   - **Rust**: Analyze `pub struct`, `pub enum`, `impl` blocks, doc comments
   - **TypeScript/JavaScript**: Analyze `export`, `interface`, `type`, functions, JSDoc
   - **React/JSX**: Analyze components, Props, Hooks, JSX structure
4. Interpret code semantics and purpose
5. Extract key information for documentation generation

### Step 5: Generate documentation content

Based on the analyzed code and language type:

1. **Generate index content**:
   - File list (filename, language tag, short description, link)
   - Directory navigation
   - One- or two-sentence description per file

2. **Generate detailed doc content** (by language):
   - **Dart**: Class description, field table (name, type, required, JSON key), `fromJson` example
   - **Rust**: Struct description, field table, method descriptions, usage example
   - **TypeScript/JavaScript**: Interface/type description, function signatures, parameter descriptions, usage example
   - **React/JSX**: Component description, Props table, usage example, Hooks description

3. Format as Markdown
4. Create language-appropriate code usage examples

### Step 6: Write documentation files

1. Determine output directory: create a sibling `docs/` directory next to the input directory
2. Create directory structure if it does not exist
3. Write files:
   - `docs/index.md` (root index)
   - `docs/{directory}/index.md` (per-directory indexes)
   - `docs/{directory}/{filename}.md` (detailed docs per file)

---

## 📝 Documentation content guidelines

### Index files (`index.md`)

**Root index** (`docs/index.md`):

- Directory overview
- Links to all subdirectories
- List of top-level files

**Directory index** (`docs/{directory}/index.md`):

- Directory description
- List of all files in that directory (filename, language tag, description, link)
- Links to subdirectories (if any)

### Detailed docs (`{filename}.md`)

Content varies by language:

#### Dart files

```markdown
# {filename}

## Overview

File description...

## Type list

### {class name}

Class description...

#### Fields

| Field | Type | Required | JSON key | Description |
| ----- | ---- | -------- | -------- | ----------- |
| ...   | ...  | ...      | ...      | ...         |

#### Usage example

\`\`\`dart
// Example code
\`\`\`
```

#### Rust files

```markdown
# {filename}

## Overview

File description...

## Type list

### {struct name}

Struct description...

#### Fields

| Field | Type | JSON key | Description |
| ----- | ---- | -------- | ----------- |
| ...   | ...  | ...      | ...         |

#### Methods

- `{method name}`: Method description

#### Usage example

\`\`\`rust
// Example code
\`\`\`
```

#### TypeScript/JavaScript files

```markdown
# {filename}

## Overview

File description...

## Exports

### {interface/type/function name}

Description...

#### Parameters/Properties

| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| ...  | ...  | ...      | ...         |

#### Usage example

\`\`\`typescript
// Example code
\`\`\`
```

#### React/JSX files

```markdown
# {Component name}

## Overview

Component description...

## Props

| Prop | Type | Required | Default | Description |
| ---- | ---- | -------- | ------- | ----------- |
| ...  | ...  | ...      | ...     | ...         |

## Usage example

\`\`\`tsx
// Example code
\`\`\`
```

---

## 🔍 Code analysis notes

### Dart file analysis

1. **Identify @freezed classes**:
   - Look for `@freezed` annotation
   - Identify `abstract class` definitions
   - Extract class name and mixin information

2. **Parse field information**:
   - Extract parameters from `const factory` constructor
   - Recognize `@JsonKey(name: '...')` annotation
   - Extract field name, type, required (`required`)
   - Handle generic types (`List<T>`, `Map<K, V>`, etc.)

3. **Understand semantics**:
   - Infer purpose from class name and fields
   - Identify `fromJson` factory
   - Understand relationships between types

### Rust file analysis

1. **Identify structs and enums**:
   - Find `pub struct` definitions
   - Find `pub enum` definitions
   - Recognize `#[derive]` attributes

2. **Parse field information**:
   - Extract struct fields (name, type)
   - Recognize `#[serde(rename = "...")]` attribute
   - Handle generics and lifetime parameters

3. **Analyze impl blocks**:
   - Identify methods in `impl` blocks
   - Extract method signatures and doc comments

### TypeScript/JavaScript file analysis

1. **Identify exports**:
   - Find `export` statements
   - Identify `interface`, `type`, `class`, `function` definitions

2. **Parse type information**:
   - Extract interface properties
   - Extract function parameters and return types
   - Identify generic parameters

3. **Analyze JSDoc**:
   - Extract documentation from `/** */` comments
   - Recognize `@param`, `@returns`, etc.

### React/JSX/TSX file analysis

1. **Identify components**:
   - Find function and class components
   - Identify Props interface/type definitions

2. **Analyze component structure**:
   - Extract Props properties
   - Identify Hooks used
   - Analyze component behavior

3. **Generate usage examples**:
   - Generate component usage from Props
   - Provide JSX code examples

---

## 🛠️ Git diff handling (update mode)

When the second parameter is `update`:

1. Run `git diff --name-only HEAD` to get the list of changed files
2. Filter to code files under the target directory (all supported language types)
3. Infer language type for changed files
4. Determine which documentation to update:
   - Detailed docs for changed files
   - Relevant directory `index.md` files
   - Root `index.md`
5. Update only those files and leave other docs unchanged

**Note**: In `sync` mode, all documentation is regenerated from the current code; git diff is not used.

---

## 📚 Supported language types

- **Dart** (`.dart`): Flutter/Dart projects
- **Rust** (`.rs`): Rust projects
- **TypeScript** (`.ts`, `.tsx`): TypeScript projects
- **JavaScript** (`.js`, `.jsx`): JavaScript projects
- **React** (`.tsx`, `.jsx`): React components
- **Next.js**: Detected via file extension (`.ts`, `.tsx`, `.js`, `.jsx`)

---

## 💡 Usage examples

```bash
# sync mode (default): regenerate all docs from code
@docsgenerate.md packages/orderly_types/lib/api
@docsgenerate.md packages/orderly_types/lib/api sync

# Full Rust documentation
@docsgenerate.md packages/orderly_utils/rust/src/api sync

# Full TypeScript/React documentation
@docsgenerate.md apps/woofi_pro/lib/components sync

# update mode: incremental update from git diff
@docsgenerate.md packages/orderly_types/lib/api update
```

---

## ⚠️ Important notes

1. **Language detection**: The assistant infers language from file extension and code; if detection is wrong, check the file extension
2. **Overwrite behavior**: `sync` overwrites all existing docs; `update` only touches docs for changed files
3. **Directory layout**: Doc directory structure mirrors the code directory structure
4. **File naming**: Doc filenames match code filenames (extension changed to `.md`)
5. **Default mode**: If the second parameter is omitted, `sync` is used

---

## 🎯 Command

Execute the documentation generation task.

**Parameter summary**:

- First parameter (required): `path` – code directory path
- Second parameter (optional): operation mode
  - `sync` (default): Regenerate all documentation from the codebase
  - `update`: Update only documentation for files changed in the current git diff

**Execution steps**:

1. **Validate parameters**:
   - Check that the first parameter (directory path `path`) exists
   - If not, report an error and exit
   - Check the second parameter: if missing or `sync`, use sync mode; if `update`, use update mode

2. **Scan directory structure**:
   - Use `list_dir` and `glob_file_search` to recursively scan the target directory
   - Find all code files (`.dart`, `.rs`, `.ts`, `.tsx`, `.js`, `.jsx`, etc.)
   - Infer language type from file extension
   - Build directory structure map

3. **Handle update mode** (when the second parameter is `update`):
   - Run `git diff --name-only HEAD` via `run_terminal_cmd`
   - Filter to changed files under the target directory
   - Determine which documentation files to update
   - If the second parameter is `sync` or omitted, skip this step and process all files

4. **Read and analyze code files**:
   - For each file to process, use `read_file` to read contents
   - Infer language from file extension and code characteristics
   - Apply the appropriate parsing strategy for that language
   - Extract key information for documentation

5. **Generate documentation content**:
   - Generate index content (file list, descriptions, links)
   - Generate detailed docs by language type
   - Format as Markdown
   - Create code usage examples

6. **Write documentation files**:
   - Create a sibling `docs/` directory next to the input directory
   - Create directory structure as needed
   - Use the `write` tool to write all documentation files

**Important**:

- Correctly infer language type and generate docs that match the language
- Index files must include file list, short descriptions, and links
- Detailed docs must include full type descriptions, field tables, and usage examples
- **sync** mode: Regenerate all documentation from the current code
- **update** mode: Update only docs for changed files; leave others unchanged
- If the second parameter is omitted, use **sync** mode

Proceed with the documentation generation task.
