# middleware

## Overview

SWR and app-level middleware: timestamp waiting, IndexedDB persistence, local time correction, signature.

## Files

| File | Language | Description |
|------|----------|-------------|
| [index](./index.md) | TypeScript | Middleware exports (if any) |
| [timestampWaitingMiddleware](./timestampWaitingMiddleware.md) | TypeScript | Waits for timestamp offset before SWR requests |
| [persistIndexedDB](./persistIndexedDB.md) | TypeScript | IndexedDB persistence middleware |
| [localTimeCorrectionMiddleware](./localTimeCorrectionMiddleware.md) | TypeScript | Local time correction for requests |
| [indexedDBManager](./indexedDBManager.md) | TypeScript | IndexedDB manager and app DB initialization |
| [signatureMiddleware](./signatureMiddleware.md) | TypeScript | Request signature middleware |
