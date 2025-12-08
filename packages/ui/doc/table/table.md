# Table System Reference

> Location: `packages/ui/src/table/*`

## Overview

The table package combines TanStack Table with custom transforms, multi-sort headers, pagination, and placeholder states. It powers advanced data grids such as order books, history logs, and leaderboards.

## Source Highlights

| File                                                | Description                                                                                 |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `dataTable.tsx`                                     | Core data table component connecting TanStack to UI renderers.                              |
| `transform.ts`                                      | `Transform` helpers to derive column configs, sorting behavior, and manual/automatic modes. |
| `multiSortHeader.tsx`                               | Column header supporting multiple sort fields per column.                                   |
| `features/*`                                        | Optional behaviors (sticky columns, row selection).                                         |
| `hooks/*`                                           | Table-specific hooks (column visibility, virtual scrolling).                                |
| `tableHeader.tsx`, `tableBody.tsx`, `tableCell.tsx` | Structural renderers.                                                                       |
| `tablePagination.tsx`                               | Pagination bar integration.                                                                 |
| `emptyDataState.tsx`, `tablePlaceholder.tsx`        | Empty and loading skeletons.                                                                |
| `README.md`                                         | Architecture notes for multi-sort.                                                          |

## Exports & Types

### `DataTable`

```typescript
function DataTable<RecordType extends any>(
  props: PropsWithChildren<DataTableProps<RecordType>>,
): JSX.Element;
```

Core data table component with sorting, pagination, and filtering.

### `Transform`

```typescript
const Transform: {
  columns: (columns: Column[], sorting: SortingState, setSorting: OnChangeFn<SortingState>) => Column[];
  dataSource: (dataSource: any[], columns: Column[], sorting: SortingState) => any[];
}
```

Helper functions for transforming columns and data source.

### `DataTableProps`

```typescript
type DataTableProps<RecordType> = {
  columns: Column<RecordType>[];
  dataSource?: RecordType[] | ReadonlyArray<RecordType> | null;
  loading?: boolean;
  ignoreLoadingCheck?: boolean;
  className?: string;
  classNames?: DataTableClassNames;
  emptyView?: ReactNode;
  bordered?: boolean;
  onSort?: (sort?: TableSort) => void;
  initialSort?: TableSort;
  id?: string;
  getRowCanExpand?: (row: Row<any>) => boolean;
  expandRowRender?: (row: Row<any>, index: number) => ReactNode;
  expanded?: ExpandedState;
  onExpandedChange?: OnChangeFn<ExpandedState>;
  getSubRows?: (record: any, index: number) => undefined | any[];
  manualSorting?: boolean;
  manualPagination?: boolean;
  manualFiltering?: boolean;
  pagination?: PaginationMeta;
  renderRowContainer?: (
    record: RecordType,
    index: number,
    children: ReactNode,
    context: Row<RecordType>,
  ) => ReactNode;
  generatedRowKey?: CoreOptions<any>["getRowId"];
  onRow?: (record: RecordType, index: number, context: Row<RecordType>) => any;
  onCell?: (
    column: TanstackColumn<any>,
    record: RecordType,
    index: number,
    context: TableCellContext,
  ) => any;
  columnFilters?: ColumnFilter | ColumnFilter[];
  rowSelection?: RowSelectionState;
  testIds?: { body?: string };
  features?: TableFeature[];
  getTableInstance?: (table: Table<RecordType>) => void;
};
```

## Props & Behavior

### DataTable Props

#### `columns` (required)

```typescript
columns: Column < RecordType > [];
```

Array of column definitions.

#### `dataSource`

```typescript
dataSource?: RecordType[] | ReadonlyArray<RecordType> | null
```

Array of data records.

#### `loading`

```typescript
loading?: boolean
```

Loading state. Default: `false`.

#### `onSort`

```typescript
onSort?: (sort?: TableSort) => void
```

Callback when sorting changes.

#### `initialSort`

```typescript
initialSort?: TableSort
```

Initial sort state.

#### `manualSorting`

```typescript
manualSorting?: boolean
```

Enable server-side sorting. When `true`, TanStack defers to external logic.

#### `manualPagination`

```typescript
manualPagination?: boolean
```

Enable server-side pagination.

#### `pagination`

```typescript
pagination?: PaginationMeta
```

Pagination metadata.

#### `emptyView`

```typescript
emptyView?: ReactNode
```

Custom empty state component.

#### `classNames`

```typescript
classNames?: DataTableClassNames
```

Class name overrides for table parts.

## Usage Examples

### Basic Table

```tsx
import { DataTable, Transform } from "@veltodefi/ui";

const {
  columns: tableColumns,
  dataSource: tableData,
  manualSorting,
} = Transform(columns, data);

<DataTable
  columns={tableColumns}
  dataSource={tableData}
  manualSorting={manualSorting}
  emptyView={<EmptyDataState message="No orders" />}
/>;
```

### Table with Sorting

```tsx
import { DataTable } from "@veltodefi/ui";

<DataTable
  columns={columns}
  dataSource={data}
  onSort={(sort) => {
    // Handle server-side sorting
    fetchData(sort);
  }}
  manualSorting={true}
/>;
```

### Table with Pagination

```tsx
import { DataTable } from "@veltodefi/ui";

<DataTable
  columns={columns}
  dataSource={data}
  pagination={{
    page: currentPage,
    pageSize: pageSize,
    total: totalRows,
  }}
  manualPagination={true}
/>;
```

## Core Concepts

- **Transform layer**: Accepts `columns` and `dataSource`, injects default `onSort` handlers, handles manual vs. automatic sorting, and returns derived props for `DataTable`.
- **MultiSort**: Columns can define `multiSort.fields` (each with `sortKey`/`label`). Headers render stacked sort buttons and `Transform` ensures data sorting matches the selected field.
- **Manual Sorting**: When certain columns require server-side sorting, `Transform` toggles `manualSorting` so TanStack defers to external logic.

## Implementation Notes

- Table uses TanStack Table (React Table v8) for core functionality
- `Transform` layer handles column and data source transformations
- Multi-sort columns support multiple sort fields per column
- Custom sorting function handles numbers, dates, and strings intelligently
- Table supports expandable rows via `getRowCanExpand` and `expandRowRender`

## Integration Tips

1. Define column schemas close to the data layer and pass them through `Transform` to keep sort/filter logic centralized.
2. Use `tablePlaceholder.tsx` to display skeleton rows while fetching, keeping layout stable.
3. Combine `tablePagination.tsx` with `PaginationItems` to manage server-driven pagination.
4. Leverage `features` (e.g., sticky headers) by enabling the corresponding props on `DataTable`.
5. Use `manualSorting` for server-side sorting and `onSort` callback to sync with API.
