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

Login uses GitHub OAuth in the browser and a short-lived local callback server.

- **Credentials file:** `~/.orderly/auth.json` (created automatically).
- The CLI opens the marketplace login page and completes OAuth callback automatically.

```bash
orderly-devkit login              # open browser, complete GitHub auth
orderly-devkit login --force      # re-authenticate even if already logged in
orderly-devkit login --port 9877  # if default port is busy (default is 9876)
orderly-devkit whoami
orderly-devkit logout
```

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

### Marketplace: `submit`, `list`, `update`, `view`

These commands use the Marketplace API. You must be logged in (`orderly-devkit login`).

**`submit`** — register a new plugin from a local directory.

- Resolves metadata from `package.json` and/or `.orderly-manifest.json`.
- `repoUrl` should be a GitHub URL (`https://github.com/<owner>/<repo>`); it can be filled from `git remote` when missing.
- **Tags** must be from the allowed set: `UI`, `Indicator`, `Order Entry`, `Trading`, `Chart`, `Portfolio`, `Analytics`, `Tool`, `Widget` (max 5).

```bash
orderly-devkit submit
orderly-devkit submit --path ./my-plugin
orderly-devkit submit -p ./my-plugin --tags UI,Trading --dry-run
orderly-devkit submit -p ./my-plugin --storybook-url https://example.com/storybook
```

**`list`** — list plugins associated with your account.

```bash
orderly-devkit list
orderly-devkit list --json
```

**`update`** — PATCH plugin metadata for an existing listing (requires `pluginId` in `.orderly-manifest.json`).

Updatable fields include: `name`, `description`, `tags`, `coverImages`, `storybookUrl`, `storybookTooltip`, `usagePrompt`.

```bash
orderly-devkit update --path ./my-plugin --dry-run
orderly-devkit update -p ./my-plugin
```

**`view`** — fetch one plugin by ID as JSON.

```bash
orderly-devkit view <plugin-id>
```

### `mcp install`

Install the **Orderly SDK Docs** MCP server entry for Claude, Codex, Cursor, OpenCode, etc.

```bash
orderly-devkit mcp install
orderly-devkit mcp install --client cursor --scope project
orderly-devkit mcp install --client all --scope user
orderly-devkit mcp install --dry-run
orderly-devkit mcp install --force
```

| Option     | Description                                                                               |
| ---------- | ----------------------------------------------------------------------------------------- |
| `--client` | `claude`, `codex`, `cursor`, `opencode`, `all`, or comma-separated list (default: `all`). |
| `--scope`  | `user` or `project` (default: `user`).                                                    |
| `--name`   | MCP server id in config (default: `orderly-sdk-docs`).                                    |

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

## License

See the repository root license for this package’s distribution terms.
