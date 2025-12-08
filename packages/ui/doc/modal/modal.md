# Modal System Reference

> Location: `packages/ui/src/modal/*.tsx`

## Overview

The modal package offers a promise-friendly modal manager. It consists of a context provider, helpers for creating managed components, and preset dialogs (`alert`, `confirm`, `dialog`, `sheet`). Components can register with the modal stack via `create` and be launched through `modalActions.show`, which returns a promise resolved when the modal closes.

## Source Structure

| File                   | Description                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| `modalContext.tsx`     | Defines `ModalProvider`, context, `modalActions`, and reducer logic.                               |
| `modalHelper.tsx`      | `create` utility that wraps a component in modal plumbing, plus `register`/`unregister` functions. |
| `useModal.tsx`         | Hook for managed components to access `visible`, `hide`, `resolve`, `reject`, `onOpenChange`.      |
| `index.tsx`            | Public exports.                                                                                    |
| `preset/*.tsx`         | Built-in modal presets (alert, confirm, dialog, sheet).                                            |
| `types.ts`, `utils.ts` | Shared types and helpers.                                                                          |

## Exports & Types

### `ModalProvider`

```typescript
const ModalProvider: React.FC<PropsWithChildren>
```

Context provider that manages the modal stack. Must wrap your app near the root.

### `create`

```typescript
const create: <P extends {}>(Comp: React.ComponentType<P>) => React.FC<P & ModalHocProps>
```

Higher-order component factory that wraps a component with modal management.

### `useModal`

```typescript
function useModal(): ModalHandler;
function useModal(modal: string, args?: Record<string, unknown>): ModalHandler;
function useModal<T extends React.FC<any>, ComponentProps extends ModalArgs<T>, ...>(modal: T, args?: PreparedProps): Omit<ModalHandler, "show"> & { show: ... };
```

Hook for accessing modal state and control functions.

### `modalActions`

```typescript
const modalActions: {
  show: (id: string, args?: Record<string, unknown>) => Promise<unknown>;
  hide: (id: string) => void;
  remove: (id: string) => void;
  updateArgs: (id: string, args: Record<string, unknown>) => void;
  setStates: (id: string, states: Record<string, unknown>) => void;
}
```

Imperative API for showing/hiding modals.

### `ModalHandler`

```typescript
interface ModalHandler<Props = Record<string, unknown>> extends ModalState {
  visible: boolean;
  keepMounted: boolean;
  show: (args?: Props) => Promise<unknown>;
  hide: () => Promise<unknown>;
  onOpenChange: (visible: boolean) => void;
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
  remove: () => void;
  setStates: (states: Record<string, unknown>) => void;
  updateArgs: (states: Record<string, unknown>) => void;
  resolveHide: (args?: unknown) => void;
}
```

### `ModalHocProps`

```typescript
interface ModalHocProps {
  id: string;
  defaultVisible?: boolean;
  keepMounted?: boolean;
}
```

## Props & Behavior

### ModalProvider Props

No props required. Wraps children and provides modal context.

### useModal Return Value

#### `visible`

```typescript
visible: boolean;
```

Whether the modal is currently visible.

#### `args`

```typescript
args?: Record<string, unknown>
```

Props passed to the modal component.

#### `states`

```typescript
states?: Record<string, unknown>
```

Internal modal state.

#### `show`

```typescript
show: (args?: Props) => Promise<unknown>;
```

Show the modal. Returns a promise that resolves when modal closes.

#### `hide`

```typescript
hide: () => Promise<unknown>;
```

Hide the modal.

#### `resolve`

```typescript
resolve: (value?: unknown) => void
```

Resolve the promise returned by `show()`.

#### `reject`

```typescript
reject: (reason?: unknown) => void
```

Reject the promise returned by `show()`.

#### `onOpenChange`

```typescript
onOpenChange: (visible: boolean) => void
```

Callback for open state changes. Automatically calls `reject` and `hide` when `false`.

#### `updateArgs`

```typescript
updateArgs: (args: Record<string, unknown>) => void
```

Update modal props dynamically.

#### `setStates`

```typescript
setStates: (states: Record<string, unknown>) => void
```

Update internal modal state.

#### `remove`

```typescript
remove: () => void
```

Remove modal from stack.

## Usage Examples

### Basic Modal

```tsx
import { create, useModal, ModalProvider } from "@veltodefi/ui";

const MyModal = create<{ message: string }>((props) => {
  const { visible, hide, resolve } = useModal();

  return (
    <SimpleDialog open={visible} onOpenChange={hide} title="Modal">
      <SimpleDialog.Body>{props.message}</SimpleDialog.Body>
      <SimpleDialog.Footer
        actions={{
          primary: { label: "Close", onClick: () => resolve(true) },
        }}
      />
    </SimpleDialog>
  );
});

function App() {
  return (
    <ModalProvider>
      <MyModal id="my-modal" />
    </ModalProvider>
  );
}
```

### Showing Modal with Promise

```tsx
import { modalActions } from "@veltodefi/ui";

async function handleAction() {
  const result = await modalActions.show("my-modal", { message: "Hello" });
  console.log("Modal closed with:", result);
}
```

### Modal with Custom Resolution

```tsx
import { create, useModal } from "@veltodefi/ui";

const ConfirmModal = create<{ onConfirm: () => void }>((props) => {
  const { visible, hide, resolve, reject } = useModal();

  return (
    <SimpleDialog open={visible} onOpenChange={hide} title="Confirm">
      <SimpleDialog.Body>Are you sure?</SimpleDialog.Body>
      <SimpleDialog.Footer
        actions={{
          secondary: {
            label: "Cancel",
            onClick: () => reject("cancelled"),
          },
          primary: {
            label: "Confirm",
            onClick: () => {
              props.onConfirm();
              resolve(true);
            },
          },
        }}
      />
    </SimpleDialog>
  );
});
```

### Using Presets

```tsx
import { alert, confirm } from "@veltodefi/ui";

// Alert preset
await alert({
  title: "Success",
  message: "Order placed successfully",
});

// Confirm preset
const confirmed = await confirm({
  title: "Delete?",
  message: "This action cannot be undone",
});
if (confirmed) {
  // User confirmed
}
```

## Implementation Notes

- Modal system uses a reducer pattern to manage modal state
- Each modal has a unique `id` for identification
- `create` wraps components with modal management, injecting `id` and modal props
- `useModal` provides access to modal state and control functions
- Promises are resolved/rejected via `resolve`/`reject` functions
- Modals can be kept mounted (`keepMounted`) for performance

## Integration Tips

1. Maintain a single `ModalProvider` high in the tree; nested providers fragment the stack and complicate closing logic.
2. Use `resolve(payload)` to pass data back to the caller (e.g., selected value) and `reject` for cancellation or unexpected closure.
3. Keep modal components pure—derive state from props or context so they can be garbage collected once hidden.
4. When mixing sheets and dialogs, ensure each preset uses unique z-indexes to prevent stacking conflicts.
5. Use `keepMounted` for modals that are frequently shown/hidden to avoid remounting overhead.
6. Use presets (`alert`, `confirm`) for common use cases to reduce boilerplate.
