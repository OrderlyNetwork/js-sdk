## @orderly.network/ui-starchild-widget

Floating action ball with a click-to-open dialog.

### Install

```bash
pnpm add @orderly.network/ui-starchild-widget
```

### Usage

```tsx
import { FloatingBall } from "@orderly.network/ui-starchild-widget";

export default function Demo() {
  return (
    <FloatingBall label="Help" position="bottom-right">
      <div>
        <h3>Need help?</h3>
        <p>Put any content here.</p>
      </div>
    </FloatingBall>
  );
}
```
