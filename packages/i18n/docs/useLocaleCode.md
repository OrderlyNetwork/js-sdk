# useLocaleCode

## Overview

React hook that returns the current i18n language code and updates when the language changes. Subscribes to i18n’s `languageChanged` event and cleans up on unmount.

## Exports

### `useLocaleCode()`

Returns `LocaleCode` – the current `i18n.language`. State is initialized from `i18n.language` and updated on the `languageChanged` event.

## Usage example

```typescript
import { useLocaleCode } from "@orderly.network/i18n";

function LanguageDisplay() {
  const localeCode = useLocaleCode();
  return <span>Current: {localeCode}</span>;
}
```
