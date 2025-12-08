# Tailwind Module Reference

> Location: `packages/ui/src/tailwind/*.ts`

## Overview

The tailwind folder contains utilities and presets that expose Orderly's design tokens to consuming Tailwind projects. Import these helpers to align your app's Tailwind configuration with the UI kit.

## Source Structure

| File            | Description                                                                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.ts`      | Entry point exporting helper functions/presets (`basePlugin`, `componentsPlugin`, `gradientPlugin`, `positionPlugin`, `scrollBarPlugin`, `sizePlugin`, `themePlugin`, `chartPlugin`). |
| `base.ts`       | Base layer styles (fonts, body background, resets).                                                                                                                                   |
| `components.ts` | Component layer utilities (e.g., `.oui-button`).                                                                                                                                      |
| `gradient.ts`   | Gradient tokens.                                                                                                                                                                      |
| `position.ts`   | Position utilities.                                                                                                                                                                   |
| `scrollBar.ts`  | Scrollbar styling helpers.                                                                                                                                                            |
| `size.ts`       | Size scale definitions.                                                                                                                                                               |
| `theme.ts`      | Raw theme object (colors, spacing, typography).                                                                                                                                       |
| `chart.ts`      | Chart-specific token definitions.                                                                                                                                                     |

## Exports & Types

### Plugins

```typescript
export const basePlugin: TailwindPlugin;
export const componentsPlugin: TailwindPlugin;
export const gradientPlugin: TailwindPlugin;
export const positionPlugin: TailwindPlugin;
export const scrollBarPlugin: TailwindPlugin;
export const sizePlugin: TailwindPlugin;
export const themePlugin: TailwindPlugin;
export const chartPlugin: TailwindPlugin;
```

Tailwind plugins for extending the configuration.

### Theme Preset

```typescript
export const theme: TailwindConfig["theme"]
```

Theme preset containing design tokens.

## Usage Examples

### Basic Tailwind Config

```ts
import { OUITailwind } from "@veltodefi/ui";

// tailwind.config.js
export default {
  presets: [OUITailwind.theme],
  plugins: [OUITailwind.base(), OUITailwind.components()],
};
```

### Extended Config

```ts
import { OUITailwind } from "@veltodefi/ui";

export default {
  presets: [OUITailwind.theme],
  plugins: [
    OUITailwind.base(),
    OUITailwind.components(),
    OUITailwind.gradient(),
    OUITailwind.position(),
    OUITailwind.scrollBar(),
  ],
  theme: {
    extend: {
      // Custom extensions
    },
  },
};
```

### With Custom Theme

```ts
import { OUITailwind } from "@veltodefi/ui";

export default {
  presets: [OUITailwind.theme],
  plugins: [OUITailwind.base(), OUITailwind.components()],
  theme: {
    extend: {
      colors: {
        custom: {
          primary: "#FF0000",
        },
      },
    },
  },
};
```

## Implementation Notes

- Plugins are functions that return Tailwind plugin configurations
- Theme preset contains all design tokens (colors, spacing, typography, etc.)
- Base plugin includes reset styles and base layer utilities
- Components plugin adds component-specific utilities
- All plugins use the `oui-` prefix for class names

## Integration Tips

1. Extend rather than replace the provided theme so future UI kit updates cascade cleanly.
2. Keep plugin order consistent (`base` before `components`) to avoid specificity issues.
3. Safelist any dynamic classes (e.g., gradient variants) if you generate class names at runtime.
4. Use the theme preset to access design tokens in your custom Tailwind configuration.
5. Combine with `OrderlyThemeProvider` for runtime theme customization.
