# @orderly.network/devkit

CLI toolkit for scaffolding plugins and modules, authenticating with Marketplace, submitting and managing plugins, and installing MCP / agent skill integrations.

## Requirements

- **Node.js** v20.19.0 or newer.

## Installation

### From npm

```bash
pnpm add -g @orderly.network/devkit
# or
npm install -g @orderly.network/devkit
```

Then run:

```bash
orderly-devkit --help
```

### One-off without global install

```bash
pnpm dlx @orderly.network/devkit --help
# or
npx @orderly.network/devkit --help
```

## Authentication

Login opens the Marketplace web login page, where you connect a wallet and sign a message. The signature is exchanged for a CLI token pair, which the web page delivers to a short-lived local callback server.

- **Credentials file:** `~/.orderly/auth.json` (created automatically).
- Access tokens are refreshed automatically; `logout` also revokes the session server-side.
- The callback port must be an integer from **9876 to 9899** — the web page refuses to deliver credentials to any other local port.

```bash
orderly-devkit login              # open browser, connect wallet and sign
orderly-devkit login --force      # re-authenticate even if already logged in
orderly-devkit login --port 9877  # if default port is busy (default is 9876)
orderly-devkit whoami             # show the account and check the session
orderly-devkit logout
```

`whoami` probes an authenticated endpoint, so an expired session is reported as such instead of appearing logged in. When the marketplace is unreachable it warns and still reports the stored account.

**Submitting also requires a linked GitHub account.** Connect it once in the web console (`https://dex.orderly.network/en/marketplace-listings`); otherwise `submit` fails with a 409.

### Environment variables

| Variable                      | Default                           | Purpose                                                                                                           |
| ----------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `ORDERLY_API_URL`             | `https://dex-api.orderly.network` | API origin. A legacy `/api`, `/api/marketplace`, or `/api/auth` suffix is stripped.                               |
| `ORDERLY_WEB_URL`             | `https://dex.orderly.network`     | Web console origin used for the login and management links.                                                       |
| `ORDERLY_HTTP_TIMEOUT_MS`     | `15000`                           | Per-request timeout for CLI HTTP calls.                                                                           |
| `GCS_PUBLIC_BASE_URL`         | —                                 | Extra origin accepted for marketplace-hosted cover URLs, for running against a local GCS emulator (see `submit`). |
| `ORDERLY_DEVKIT_NO_ENV_HINTS` | —                                 | Set to any non-empty value to suppress the post-`create`/`submit` tip about the SDK Docs MCP.                     |
| `ORDERLY_MCP_INSTALL_DEBUG`   | —                                 | Set to `1` or `true` to trace `mcp install` child-process failures on stderr.                                     |

## Commands overview

Run `orderly-devkit <command> --help` for options on any command.

### `create`

Scaffold new artifacts (interactive).

| Subcommand      | Description                                                                                                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `create plugin` | Clone and render the plugin template (`OrderlyNetwork/orderly-plugin-template`), prompt for name/plugin id/interceptor target, and optionally generate `.orderly-manifest.json`. |
| `create module` | Guided flow for module type (`page`, `component`, `hook`, `utils`, `module`). **File generation is not implemented yet**—it only collects choices and prints a summary.          |

```bash
orderly-devkit create plugin
orderly-devkit create module
orderly-devkit create module --name my-module
```

### `schema`

Derive a plugin's `configSchema.json` — the dynamic options form Orderly One renders on install — from the `register*Plugin(options)` signature. No login required.

- Types derive from the first parameter: `string`, `number`, `integer`, `boolean`, `?` optionality, and string/number literal unions (→ `enum`). Unsupported types are skipped with a warning.
- JSDoc on each option becomes the form field:

| JSDoc              | Schema field  | Applies to      |
| ------------------ | ------------- | --------------- |
| doc comment        | `description` | all             |
| `@default <value>` | `default`     | all             |
| `@minimum`         | `minimum`     | number, integer |
| `@maximum`         | `maximum`     | number, integer |
| `@minLength`       | `minLength`   | string          |
| `@maxLength`       | `maxLength`   | string          |
| `@pattern`         | `pattern`     | string          |

```bash
orderly-devkit schema -p ./my-plugin                 # print the derived schema
orderly-devkit schema -p ./my-plugin --write         # create configSchema.json when missing
orderly-devkit schema -p ./my-plugin --write --force # regenerate it from source
orderly-devkit schema -p ./my-plugin --check         # fail on missing/drift (CI)
```

- `--write` also adds `configSchema.json` to `package.json` `files` when that allow-list exists, so the schema ships with the npm package.
- `--check` prints a property-level diff and exits non-zero when the checked-in file is missing or out of sync with source; it never modifies files. A plugin without derivable `register*Plugin` options cannot be verified and is reported as such.

### Marketplace: `submit`, `search`, `list`, `update`, `view`, `disable`

These commands use the Marketplace API. Public read commands (`search`, `view`) do not require login. Owner-scoped commands (`submit`, `list`, `update`, `disable`) require login (`orderly-devkit login`).

**`submit`** — register a new plugin from a local directory.

- Resolves metadata from `package.json` and/or `.orderly-manifest.json`.
- Required: `npmName`, `repoUrl`, `name`, `description`, at least one tag, and at least one cover image. `name` and `description` are prompted for when missing.
- `repoUrl` should be a GitHub URL (`https://github.com/<owner>/<repo>`); it can be filled from `git remote` when missing.
- `--write-schema` writes the derived `configSchema.json` when the file is missing; without it the schema is derived from source on the fly for the submission payload. Commit the file and run `orderly-devkit schema --check` in CI so it stays in sync.
- **Tags** must be from the allowed set (max 5): `UI`, `Indicator`, `Order Entry`, `Trading`, `Chart`, `Portfolio`, `Analytics`, `Market`, `OrderBook`, `Deposit`, `Withdraw`, `Transfer`, `Swap`, `Liquidity`, `Staking`, `Rewards`, `Tool`, `Widget`, `AI`.
- **`coverImages`** (1–5) may be local paths relative to the plugin directory; they are uploaded to the Marketplace and replaced with the managed URLs. `--dry-run` validates them without uploading.
  Existing remote covers must use `https://oss.orderly.network/marketplace/`. Third-party or malformed URLs are rejected before any upload. For a local GCS emulator, set `GCS_PUBLIC_BASE_URL` to the same origin configured on the backend; `/marketplace/` is still required.
- `pluginId` is optional — the backend derives it from the npm package name when omitted.
- Submissions are queued and audited asynchronously; the command reports the submission status rather than a final listing. Resubmitting before the audit finishes returns a 409 — track the submission with `list` and resubmit once it completes.

```bash
orderly-devkit submit
orderly-devkit submit --path ./my-plugin
orderly-devkit submit -p ./my-plugin --tags UI,Trading --dry-run
orderly-devkit submit -p ./my-plugin --write-schema
```

**`search`** — search public available plugins in Marketplace. `--tag` accepts a tag display name (e.g. `Order Entry`) or its slug (e.g. `order-entry`); display names are converted to slugs automatically.

```bash
orderly-devkit search
orderly-devkit search orderbook
orderly-devkit search orderbook --tag trading --limit 5
orderly-devkit search funding --sort updated --order desc --json
```

**`list`** — list plugins associated with your account, including the latest audit status for each.

```bash
orderly-devkit list
orderly-devkit list --json
```

Note that listings only appear here once the audit worker has created them; a queued submission is not yet a listing.

**`update`** — PATCH plugin metadata for an existing listing (requires `pluginId` in `.orderly-manifest.json`).

Updatable fields: `name`, `description`, `tags`, `coverImages`, `usagePrompt`. Local `coverImages` are uploaded before the PATCH, and only on a real run — `--dry-run` validates them without uploading. An explicit `usagePrompt: null` (or `""`) in the manifest clears the server-side value; a generated manifest simply omits the field.

```bash
orderly-devkit update --path ./my-plugin --dry-run
orderly-devkit update -p ./my-plugin
```

**`view`** — fetch one plugin by ID as JSON.

```bash
orderly-devkit view <plugin-id>
```

**`disable`** — delist one of your plugins (sets its status to `deprecated`). Only `available` plugins can be delisted, and the change cannot be undone from the CLI.

```bash
orderly-devkit disable
orderly-devkit disable --pluginId my-plugin-id
```

> `delete` is no longer supported: the Marketplace API exposes no delete endpoint. Use `disable` to delist, or manage listings in the web console.

### `mcp install`

Install the **Orderly SDK Docs** MCP server entry for Claude, Codex, Cursor, OpenCode, etc.

```bash
orderly-devkit mcp install
orderly-devkit mcp install --client cursor --scope project
orderly-devkit mcp install --client all --scope user
orderly-devkit mcp install --sdk-docs-version 0.1.0
orderly-devkit mcp install --dry-run
orderly-devkit mcp install --force
```

| Option               | Description                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `--client`           | `claude`, `codex`, `cursor`, `opencode`, `all`, or comma-separated list (default: `all`).                        |
| `--scope`            | `user` or `project` (default: `user`).                                                                           |
| `--name`             | MCP server id in config (default: `orderly-sdk-docs`).                                                           |
| `--sdk-docs-version` | Pin `@orderly.network/sdk-docs` to a version or dist-tag (e.g. `0.1.0`, `beta`) for this run and written config. |
| `--dry-run`          | Print the planned config changes without writing any files.                                                      |
| `--force`            | Replace an existing MCP entry wholesale instead of merging into it (drops fields you added to the entry).        |

### `mcp detect`

Check whether the **Orderly SDK Docs** MCP server is already configured for your coding agents. Claude, Codex, Cursor, and OpenCode are each inspected at both **user** scope (e.g. `~/.cursor/mcp.json`) and **project** scope (e.g. `.cursor/mcp.json` under the current directory). The report lists every config path with its state — `configured` (with the matched server key), `not detected`, `no file`, or `invalid JSON` — and is read-only: config files are never modified.

```bash
orderly-devkit mcp detect
orderly-devkit mcp detect --client cursor
orderly-devkit mcp detect --json
```

| Option     | Description                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------- |
| `--client` | `claude`, `codex`, `cursor`, `opencode`, `all`, or comma-separated list (default: `all`).         |
| `--json`   | Print a machine-readable JSON report (paths, states, matched server key) instead of human output. |

### `skills install`

Install Orderly **agent skills** for plugin workflows (create, write, add, submit) with `npx -y skills add …`.

Default behavior installs four skills non-interactively: `orderly-plugin-create`, `orderly-plugin-write`, `orderly-plugin-add`, `orderly-plugin-submit`.

```bash
orderly-devkit skills install
orderly-devkit skills install --list
orderly-devkit skills install --dry-run
orderly-devkit skills install other/repo --skill my-skill -y
orderly-devkit skills install -- --some-upstream-skills-flag
```

| Option            | Description                                                             |
| ----------------- | ----------------------------------------------------------------------- |
| `[source]`        | GitHub `owner/repo`, URL, or local path (default source is built in).   |
| `--list`          | List skills in the source without installing.                           |
| `--skill` / `-s`  | Repeatable; install only named skills (replaces default four when set). |
| `--all`           | Forward `--all` to the skills CLI.                                      |
| `--global` / `-g` | Global install for the skills CLI.                                      |
| `--agent` / `-a`  | Target agent(s), e.g. `-a cursor`.                                      |
| `--copy`          | Copy files instead of symlinks.                                         |
| `--yes` / `-y`    | With `--list` only: pass `-y` through.                                  |
| `--`              | Everything after `--` is forwarded to the upstream `skills` CLI.        |

## Troubleshooting

- **Marketplace API errors** — check your network connection; if the CLI reports a failed request, try again later or verify you are logged in (`orderly-devkit whoami`).
- **Login: port in use** — run `orderly-devkit login --port <free-port>`.
- **Ctrl+C during prompts** — the CLI handles enquirer cancellation and exits with a clear message when possible.
- **Invalid working directory** — if the shell’s cwd was deleted, the CLI may switch to `HOME` or the package directory and warn you.
- **`mcp install` hangs or fails silently** — set `ORDERLY_MCP_INSTALL_DEBUG=1` to trace the child process, and verify `npx` is available on `PATH`.

## License

See the repository root license for this package’s distribution terms.
