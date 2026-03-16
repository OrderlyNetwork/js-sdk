# services

## Overview

Order creators (limit, market, stop, bracket, TPSL, scaled, etc.), order merge handlers, painter (poster/layout), data center, amplitude tracker.

## Subdirectories

| Directory | Description |
|-----------|-------------|
| [orderCreator](./orderCreator/index.md) | Order creator implementations and factory |
| [orderMerge](./orderMerge/index.md) | Order merge handlers (regular, algo) |
| [painter](./painter/index.md) | Poster painting and layout config |

## Root-level files

| File | Language | Description |
|------|----------|-------------|
| [dataCenter](./dataCenter.md) | TypeScript | Data center service |
| [amplitudeTracker](./amplitudeTracker.md) | TypeScript | Amplitude tracking |
