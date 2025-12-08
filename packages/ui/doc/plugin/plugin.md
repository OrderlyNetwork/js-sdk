# Plugin System Reference

> Location: `packages/ui/src/plugin/*.ts(x)`

## Overview

The plugin system lets external modules register UI extensions (nav items, panels, action sheets) at runtime. Extensions declare metadata (name, scope, positions) and a builder function to consume shared context before rendering.

## Source Structure

| File                                      | Description                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------------ |
| `install.tsx`                             | Exports `installExtension` and `setExtensionBuilder`.                          |
| `pluginContext.tsx`                       | Provides `ExtensionProvider` and context wiring.                               |
| `registry.ts`                             | Singleton registry storing extension definitions (`OrderlyExtensionRegistry`). |
| `slot.tsx`                                | `ExtensionSlot` component that renders extensions for a given position.        |
| `types.ts`                                | Shared types (`ExtensionOptions`, `ExtensionPositionEnum`, etc.).              |
| `useBuilder.ts`, `useExtensionBuilder.ts` | Hooks for consuming builder data.                                              |
| `notFound.tsx`                            | Fallback UI when no extension matches.                                         |

## Exports & Types

### `installExtension`

```typescript
const installExtension: <Props>(
  options: ExtensionOptions<Props>
) => (component: ExtensionRenderComponentType<Props>) => void
```

Function to register an extension component.

### `setExtensionBuilder`

```typescript
const setExtensionBuilder: <Props extends unknown = {}>(
  position: ExtensionPosition,
  builder: () => Props
) => void
```

Updates the extension builder function for a position.

### `ExtensionProvider`

```typescript
const ExtensionProvider: React.FC<PropsWithChildren<ExtensionProviderProps>>
```

Provider component that supplies extension context.

### `ExtensionSlot`

```typescript
const ExtensionSlot: React.FC<ExtensionSlotProps>
```

Component that renders extensions for a given position.

### `ExtensionOptions`

```typescript
type ExtensionOptions<Props> = {
  name: string;
  scope?: string[];
  engines?: string;
  positions: ExtensionPosition[];
  builder?: (props: any) => Props;
  __isInternal?: boolean;
  entry?: string[];
  installed?: () => Promise<void>;
  onInit?: () => void;
  activate?: () => Promise<void>;
  deactivate?: () => Promise<void>;
};
```

### `ExtensionPosition`

```typescript
type ExtensionPosition = string | ExtensionPositionEnum;
```

Extension position identifier.

## Props & Behavior

### ExtensionOptions

#### `name` (required)

```typescript
name: string;
```

Unique extension name (e.g., `"orderly/customWidget"`).

#### `positions` (required)

```typescript
positions: ExtensionPosition[]
```

Where the extension renders (e.g., `[ExtensionPositionEnum.MainNav]`).

#### `scope`

```typescript
scope?: string[]
```

Which context data the extension can access. Default: `["*"]`.

#### `builder`

```typescript
builder?: (props: any) => Props
```

Optional function returning props derived from shared context.

#### `__isInternal`

```typescript
__isInternal?: boolean
```

Marks first-party extensions.

#### `installed`, `onInit`, `activate`, `deactivate`

Lifecycle hooks for extension initialization and state management.

### ExtensionSlot Props

#### `position` (required)

```typescript
position: ExtensionPosition;
```

Position to render extensions for.

## Usage Examples

### Registering an Extension

```tsx
import { installExtension, ExtensionPositionEnum } from "@veltodefi/ui";

installExtension({
  name: "orderly/customWidget",
  scope: ["*"],
  positions: [ExtensionPositionEnum.MainNav],
  builder: () => ({ theme: "dark" }),
})((props) => <CustomWidget {...props} />);
```

### Rendering Extensions

```tsx
import { ExtensionSlot, ExtensionPositionEnum } from "@veltodefi/ui";

<ExtensionSlot position={ExtensionPositionEnum.MainNav} />;
```

### Extension with Lifecycle Hooks

```tsx
import { installExtension, ExtensionPositionEnum } from "@veltodefi/ui";

installExtension({
  name: "orderly/myExtension",
  positions: [ExtensionPositionEnum.SideNav],
  onInit: () => {
    console.log("Extension initialized");
  },
  activate: async () => {
    // Load extension resources
  },
  deactivate: async () => {
    // Cleanup
  },
})((props) => <MyExtension {...props} />);
```

### Setting Extension Builder

```tsx
import { setExtensionBuilder, ExtensionPositionEnum } from "@veltodefi/ui";

setExtensionBuilder(ExtensionPositionEnum.MainNav, () => ({
  theme: "dark",
  userId: currentUser.id,
}));
```

## Implementation Notes

- Extensions are registered in a singleton registry (`OrderlyExtensionRegistry`)
- `ExtensionSlot` looks up all registered extensions for the specified position and renders them in order
- Builder functions allow extensions to consume shared context
- Lifecycle hooks enable initialization and cleanup logic
- Extensions can be scoped to specific contexts or routes

## Integration Tips

1. Keep extension registration side-effectful but idempotent—guard repeated `installExtension` calls when hot reloading.
2. Use `scope` to limit extensions to certain tenants or routes (pass context to the provider).
3. Provide a default `ExtensionSlot` fallback (e.g., skeleton or message) when critical slots have no extensions installed.
4. Use lifecycle hooks for resource management and initialization.
5. Use `setExtensionBuilder` to provide shared context to all extensions at a position.
