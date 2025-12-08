# Alert Preset Reference

> Location: `packages/ui/src/dialog/alertDialog.tsx`, `packages/ui/src/modal/preset/alert.tsx`

## Overview

The alert preset combines `AlertDialog` (a `SimpleDialog` variant) with the modal manager to expose a promise-based `alert(props)` helper. Use it for confirmations, warnings, or informational prompts where you only need “OK” and optional “Cancel” actions.

## Files

| File                     | Description                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| `dialog/alertDialog.tsx` | UI layer handling layout, locale-driven labels, and responsive sizing.                            |
| `modal/preset/alert.tsx` | Registers `AlertDialog` with the modal context via `create()` and exports the `alert()` function. |

## `AlertDialogProps`

```ts
export type AlertDialogProps = {
  message?: ReactNode;
  onOk?: () => Promise<boolean> | boolean;
  onCancel?: () => void;
  okLabel?: string;
  cancelLabel?: string;
  actions?: {
    primary?: Partial<DialogAction>;
    secondary?: Partial<DialogAction>;
  };
} & Pick<
  SimpleDialogProps,
  "open" | "onOpenChange" | "title" | "closable" | "classNames" | "size"
>;
```

- `message`: Body content (any React node).
- `onOk` / `onCancel`: Button callbacks. `onOk` may return a promise; completion triggers `hide()`.
- `okLabel` / `cancelLabel`: Override localized defaults from `useLocale("dialog")`.
- `actions`: Customize button props (size, className, loading state) while still inheriting defaults.
- Inherits standard `SimpleDialog` props so you can control `open` externally if needed.

## UI Behavior

1. `useLocale("dialog")` supplies default “OK” and “Cancel” strings.
2. `useScreen()` picks the default dialog size (`xs` on mobile, `sm` on desktop) unless `size` is provided.
3. Button config is generated dynamically based on whether `onOk`/`onCancel` exist; both default to full-width on mobile.
4. `SimpleDialog` slot classNames are overridden to match Orderly surfaces.

## Modal Preset Implementation

```ts
export const CreatedAlertDialog = create<AlertDialogProps>((props) => {
  const { onOk } = props;
  const { visible, hide, resolve, reject, onOpenChange } = useModal();
  const onOkHandler = useCallback(() => Promise.resolve().then(onOk).then(hide), [onOk]);
  return (
    <AlertDialog
      open={visible}
      onOpenChange={onOpenChange}
      {...props}
      onOk={onOkHandler}
    />
  );
});

export const alert = (props: AlertDialogProps) =>
  modalActions.show(CreatedAlertDialog, props);
```

- `create()` wires the component into the modal stack and serves resolver functions to `useModal()`.
- `modalActions.show` pushes the dialog, returning a promise resolved via `resolve()` (unused by default but customizable) and rejected via `reject()`/`hide()`.

## Usage

```tsx
import { alert } from "@veltodefi/ui";

async function handleDangerousAction() {
  await alert({
    title: "Close position?",
    message: "The system will market-close this position.",
    onOk: async () => {
      await closePosition();
      return true;
    },
    onCancel: () => console.log("User canceled"),
    actions: {
      primary: { size: "md" },
      secondary: { className: "oui-text-base-contrast" },
    },
  });
}
```

- Promise resolves when `onOk` completes and the dialog hides; add `resolve(customPayload)` if you need to return data.
- You can also render `AlertDialog` directly in controlled mode without the modal preset.

## Tips

1. Override `actions.primary/secondary` to match context (danger buttons, loading indicators).
2. Provide translations via `OrderlyLocaleProvider`; `AlertDialog` automatically picks up localized labels.
3. Chain alerts by triggering another `alert()` inside `onOk` once the promise resolves.
4. Handle rejection/cleanup by attaching `.catch` to the returned promise (e.g., when the user dismisses the dialog externally).
