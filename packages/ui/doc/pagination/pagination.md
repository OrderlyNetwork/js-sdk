# Pagination Reference

> Location: `packages/ui/src/pagination/pagination.tsx`, `packages/ui/src/pagination/index.ts`

## Overview

`PaginationItems` provides a standardized pagination bar with previous/next buttons, page numbers, and optional page-size controls. It's typically paired with `Table` or list components to navigate large datasets.

## Source Structure

| File             | Description                                                                                                                                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pagination.tsx` | Exports `PaginationItems`, `Paginations`, and supporting components (`Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`). |
| `index.ts`       | Re-exports `PaginationItems`.                                                                                                                                                                              |

## Exports & Types

### `PaginationItems`

```typescript
const PaginationItems: (props: Omit<PaginationProps, "onPageSizeChange">) => JSX.Element | null
```

Pagination component with page navigation controls.

### `Paginations`

```typescript
const Paginations: (props: PaginationProps) => JSX.Element
```

Full pagination component including page size selector.

### `PaginationProps`

```typescript
type PaginationProps = {
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSize?: number;
  page: number;
  count: number;
  pageTotal: number;
  className?: string;
  classNames?: {
    pagination?: string;
    paginationContent?: string;
    paginationItem?: string;
    paginationLink?: string;
    paginationPrevious?: string;
    paginationNext?: string;
    paginationEllipsis?: string;
  };
  hideRowsPerPage?: boolean;
  generatePageNumbers?: (
    currentPage: number,
    totalPages: number,
  ) => (number | string)[];
};
```

## Props & Behavior

### PaginationProps

#### `page` (required)

```typescript
page: number;
```

Current page (1-based).

#### `pageTotal` (required)

```typescript
pageTotal: number;
```

Total number of pages.

#### `count` (required)

```typescript
count: number;
```

Total number of items/rows.

#### `pageSize`

```typescript
pageSize?: number
```

Rows per page. Default: `5`.

#### `onPageChange`

```typescript
onPageChange?: (page: number) => void
```

Callback when user selects a new page.

#### `onPageSizeChange`

```typescript
onPageSizeChange?: (pageSize: number) => void
```

Callback when page size changes (only used by `Paginations`).

#### `hideRowsPerPage`

```typescript
hideRowsPerPage?: boolean
```

Hide the page size selector. Default: `false`.

#### `generatePageNumbers`

```typescript
generatePageNumbers?: (currentPage: number, totalPages: number) => (number | string)[]
```

Custom function to generate page numbers. Default implementation shows up to 5 pages with ellipses.

#### `classNames`

```typescript
classNames?: {
  pagination?: string;
  paginationContent?: string;
  paginationItem?: string;
  paginationLink?: string;
  paginationPrevious?: string;
  paginationNext?: string;
  paginationEllipsis?: string;
}
```

Class name overrides for pagination components.

#### `className`

```typescript
className?: string
```

Additional CSS classes.

## Usage Examples

### Basic Pagination

```tsx
import { PaginationItems } from "@veltodefi/ui";

<PaginationItems
  page={page}
  pageTotal={totalPages}
  count={totalRows}
  onPageChange={setPage}
  className="oui-justify-end"
/>;
```

### Pagination with Page Size

```tsx
import { Paginations } from "@veltodefi/ui";

<Paginations
  page={page}
  pageSize={pageSize}
  pageTotal={totalPages}
  count={totalRows}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
/>;
```

### Custom Page Number Generation

```tsx
import { PaginationItems } from "@veltodefi/ui";

<PaginationItems
  page={page}
  pageTotal={totalPages}
  count={totalRows}
  onPageChange={setPage}
  generatePageNumbers={(current, total) => {
    // Custom logic
    return [1, 2, 3, "...", total];
  }}
/>;
```

### Hide Page Size Selector

```tsx
import { Paginations } from "@veltodefi/ui";

<Paginations
  page={page}
  pageTotal={totalPages}
  count={totalRows}
  onPageChange={setPage}
  hideRowsPerPage={true}
/>;
```

## Implementation Notes

- Computes page numbers automatically with ellipses for large page counts
- Disables previous/next buttons when on the first or last page
- Shows ellipses (`...`) for large page counts while respecting the default algorithm (shows up to 5 pages)
- Returns `null` if `pageTotal <= 1` to avoid rendering unnecessary controls
- Page size selector uses `Select.options` with predefined options: 10, 20, 50, 100

## Integration Tips

1. Keep pagination state in sync with URL query parameters for shareable links and analytics.
2. Combine with data-fetching libraries (React Query) by refetching data when `page` or `pageSize` changes.
3. Hide page numbers on very small screens—render only previous/next buttons or move pagination into a `Select`.
4. Use `generatePageNumbers` to customize the page number display algorithm for specific use cases.
5. Use `classNames` to customize styling of individual pagination components.
