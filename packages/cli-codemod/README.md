# Orderly Codemod

`orderly-codemod` is a command-line tool to help you migrate the package import and `OrderlyAppProvider` configuration from v1 to v2

## Usage

```bash
npx @orderly.network/codemod [OPTION] PATH
```

- `PATH`: Specifies the file or directory path to be transformed (required).

### Options

- `-p, --parser <string>`  
  Specifies the parser for source files. Supported options:

  - `babel`
  - `babylon`
  - `flow`
  - `ts`
  - `tsx`

  Default: `tsx`.

  Please note that when using TypeScript, you need to use the tsx parser; otherwise, the codemod cannot be correctly applied!

- `--ext, --extensions <string>`  
  Specifies file extensions to transform, with multiple extensions separated by commas. Default: `tsx`.

- `-i, --ignore <string>`  
  Specifies a glob pattern to ignore files. Default: `node_modules`.

### Examples

- **Scan all `.tsx` files in a specified directory with default settings:**

  ```bash
  npx @orderly.network/codemod src/
  ```

- **Custom extensions:**

  ```bash
  npx @orderly.network/codemod --extensions jsx src/
  ```

- **Ignore files in the `dist` folder:**

  ```bash
  npx @orderly.network/codemod --ignore dist src/
  ```

Note: Applying a codemod may disrupt your existing code formatting, so don’t forget to run prettier and/or eslint after applying the codemod!

### Help

Run the following command to display help information:

```bash
npx @orderly.network/codemod --help
```

### Error Handling

If no file or directory path is provided, the tool will display an error message:

```
Error: You have to provide at least one file/directory to transform.
```
