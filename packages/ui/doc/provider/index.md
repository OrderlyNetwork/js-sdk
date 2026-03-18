# provider — Directory Index

## Directory Responsibility

Theme and component providers: OrderlyThemeProvider, useOrderlyTheme, OrderlyThemeContext (ThemeConfig), and ComponentProvider for app-wide theme and component overrides.

## Files

| File                     | Language | Summary                         | Link                                               |
| ------------------------ | -------- | ------------------------------- | -------------------------------------------------- |
| componentProvider.tsx    | TSX      | ComponentProvider for overrides | [componentProvider.md](componentProvider.md)       |
| orderlyThemeContext.tsx  | TSX      | useOrderlyTheme, ThemeConfig    | [orderlyThemeContext.md](orderlyThemeContext.md)   |
| orderlyThemeProvider.tsx | TSX      | OrderlyThemeProvider            | [orderlyThemeProvider.md](orderlyThemeProvider.md) |

## Key Entities

| Entity               | File                     | Role                                    |
| -------------------- | ------------------------ | --------------------------------------- |
| OrderlyThemeProvider | orderlyThemeProvider.tsx | Wraps app with theme (CSS vars, config) |
| useOrderlyTheme      | orderlyThemeContext.tsx  | Hook for theme config                   |
| ComponentProvider    | componentProvider.tsx    | Override default components             |
