# types

## Overview

Type definitions for locale codes, locale messages, and i18next resource shape. Extends i18next’s `CustomTypeOptions` so the `t` function gets key autocomplete from `LocaleMessages`.

## Exports

### `LocaleCode`

`keyof typeof LocaleEnum | (string & {})` – supported locale codes or extended string for custom locales.

### `LocaleMessages`

Interface extending the default English message type (`EnType`) and `Record<"extend.${string}", string>` for extensible keys. Other packages can extend this interface for additional keys.

### `Resources<T>`

```ts
{
  [key in LocaleCode]?: Partial<LocaleMessages & T>;
}
```

Maps locale codes to optional partial message objects. Used by `LocaleProvider`’s `resources` prop.

### Module augmentation

Declares `i18next` module with `CustomTypeOptions.resources[defaultNS]: LocaleMessages` so `t(...)` keys are typed from `LocaleMessages`.

## Usage example

```typescript
import type { LocaleCode, LocaleMessages, Resources } from "@orderly.network/i18n";

const resources: Resources = {
  en: { "common.cancel": "Cancel" },
  zh: { "common.cancel": "取消" },
};
```
