# footer.widget

> Location: `packages/ui-scaffold/src/components/footer/footer.widget.tsx`

## Overview

Combines `useFooterScript()` (e.g. WS status) with `Footer` UI. Exports `FooterWidget` and `FooterProps`.

## Props (`FooterProps`)

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| telegramUrl | `string` | No | Telegram link |
| twitterUrl | `string` | No | Twitter link |
| discordUrl | `string` | No | Discord link |
| trailing | `ReactNode` | No | Trailing content |

## Usage example

```tsx
import { FooterWidget } from "@orderly.network/ui-scaffold";

<FooterWidget twitterUrl="..." wsStatus={...} />
```
