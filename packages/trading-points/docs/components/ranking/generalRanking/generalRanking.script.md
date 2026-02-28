# generalRanking.script.ts

## Overview

Hook that fetches points rankings for the current stage and time range, handles pagination (desktop) and infinite scroll (mobile), and merges current user row into the list.

## Exports

### Types

| Name | Description |
|------|-------------|
| `GeneralRankingData` | address, points?, rank?, broker_id?, key? |
| `GeneralRankingResponse` | meta (RecordsMeta), rows (rank, address, total_points) |
| `GeneralRankingScriptReturn` | Return type of useGeneralRankingScript |
| `GeneralRankingScriptOptions` | { address?: string } (optional search filter) |

### Function

| Name | Description |
|------|-------------|
| `useGeneralRankingScript` | Fetches rankings via getRankingUrl, pagination + infinite query, returns dataSource, dataList, pagination, sentinelRef, isLoading, address. |

## useGeneralRankingScript options

| Option | Type | Description |
|--------|------|-------------|
| address | string | Optional; filter to this address. |

## Return value (GeneralRankingScriptReturn)

| Property | Type | Description |
|----------|------|-------------|
| pagination | object | For desktop DataTable. |
| dataSource | GeneralRankingData[] | Desktop table data. |
| dataList | GeneralRankingData[] | Mobile list data (infinite). |
| isLoading | boolean | Loading state. |
| isMobile | boolean | From useScreen. |
| sentinelRef | RefObject | For useEndReached (mobile). |
| address | string \| undefined | Current user address. |

## Usage example

```tsx
const state = useGeneralRankingScript({ address: searchAddress });
<Ranking {...state} fields={["rank", "address", "points"]} type="general" />
```
