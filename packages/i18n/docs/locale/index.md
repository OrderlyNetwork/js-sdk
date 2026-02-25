# locale

## Overview

Contains the default English locale messages and modular message namespaces. The root `en` object is assembled in `en.ts` from all modules under `module/`.

## Files

| File | Language | Description |
|------|----------|-------------|
| [en](./en.md) | TypeScript | Default English locale; merges all module messages |
| [module](./module/index.md) | — | Subdirectory of per-feature message modules |

## Usage

Import the default English messages:

```typescript
import { en } from "@orderly.network/i18n";
// or from source
import { en } from "./locale/en";
```

Other locales are typically loaded at runtime via `Backend` and `LocaleProvider` (e.g. from URLs).
