# index (package entry)

## Overview

Package entry point for `@orderly.network/chart`. Re-exports Orderly chart components (PnL bar/line/area, asset line/area, volume bar), related types and data item types, Recharts primitives (LineChart, Line, BarChart, Bar, Cell, Area, AreaChart), and the Tailwind chart plugin.

## Exports

### Chart components

- `PnLBarChart` — from `./orderly/pnlBar`
- `PnlLineChart` — from `./orderly/pnlLine`
- `PnlAreaChart` — from `./orderly/pnlArea`
- `AssetLineChart` — from `./orderly/assetLine`
- `AssetAreaChart` — from `./orderly/assetArea`
- `VolBarChart` — from `./orderly/volBar`

### Types

- `PnlLineChartProps`, `AssetChartDataItem` — from `./orderly/assetLine`
- `PnlAreaChartProps` — from `./orderly/assetArea`
- `VolChartDataItem` — from `./orderly/volBar`

### Recharts

- `LineChart`, `Line`, `BarChart`, `Bar`, `Cell`, `Area`, `AreaChart` — from `recharts`

### Tailwind

- `chartPlugin` — from `./tailwindcss/theme`

## Usage example

```ts
import {
  PnLBarChart,
  PnlLineChart,
  AssetLineChart,
  VolBarChart,
  chartPlugin,
} from "@orderly.network/chart";

<PnLBarChart data={pnlData} />
<PnlLineChart data={cumulativePnl} />
<AssetLineChart data={accountValueData} />
<VolBarChart data={volumeData} />

// tailwind.config.js
import { chartPlugin } from "@orderly.network/chart";
plugins: [chartPlugin],
```
