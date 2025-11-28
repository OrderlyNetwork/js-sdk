# Pickers Reference

> Location: `packages/ui/src/pickers/*.tsx`

## Overview

Pickers deliver date and date-range selection experiences using shared dropdown/popup infrastructure. They combine `Popover`, `Input`, and calendar renderers with preset shortcuts and validation logic for trading and analytics use cases.

## Source Structure

| File                  | Description                                                                       |
| --------------------- | --------------------------------------------------------------------------------- |
| `picker.tsx`          | Base component controlling input display, dropdown visibility, and clear buttons. |
| `datepicker.tsx`      | Single-date picker implementation (`DatePicker`).                                 |
| `dateRangePicker.tsx` | Two-pane range picker with optional presets (`DateRangePicker`).                  |
| `date/*`              | Calendar header, grid, and cell components (`Calendar`, etc.).                    |
| `index.ts`            | Public exports and types.                                                         |

## Exports & Types

### `DatePicker`

```typescript
const DatePicker: React.FC<DatePickerProps>
```

Single-date picker component.

### `DateRangePicker`

```typescript
const DateRangePicker: React.FC<DateRangePickerProps>
```

Date range picker component.

### `Calendar`

```typescript
const Calendar: React.FC<CalendarProps>
```

Calendar component (from `react-day-picker`).

### `DatePickerProps`

```typescript
type DatePickerProps = {
  onChange?: (date: Date) => void;
  placeholder?: string;
  value?: Date;
  dateFormat?: string;
  size?: SizeType;
  className?: string;
} & CalendarProps;
```

### `DateRangePickerProps`

```typescript
type DateRangePickerProps = {
  value?: [Date, Date];
  defaultValue?: [Date, Date];
  onChange?: (range: [Date, Date]) => void;
  presets?: Array<{ label: string; value: [Date, Date]; description?: string }>;
  disabledDate?: (date: Date) => boolean;
  format?: string;
  allowClear?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  contentClassName?: string;
  panelRender?: (content: ReactNode) => ReactNode;
};
```

## Props & Behavior

### DatePicker Props

#### `value`

```typescript
value?: Date
```

Selected date.

#### `defaultValue`

```typescript
defaultValue?: Date
```

Default selected date.

#### `onChange`

```typescript
onChange?: (date: Date) => void
```

Callback when date is selected.

#### `placeholder`

```typescript
placeholder?: string
```

Placeholder text. Defaults to locale string.

#### `dateFormat`

```typescript
dateFormat?: string
```

Display format. Default: `"YYYY-MM-DD"`.

#### `size`

```typescript
size?: SizeType
```

Picker size variant.

Inherits all `CalendarProps` from `react-day-picker`.

### DateRangePicker Props

#### `value`

```typescript
value?: [Date, Date]
```

Selected date range.

#### `defaultValue`

```typescript
defaultValue?: [Date, Date]
```

Default selected range.

#### `onChange`

```typescript
onChange?: (range: [Date, Date]) => void
```

Callback when range is selected.

#### `presets`

```typescript
presets?: Array<{ label: string; value: [Date, Date]; description?: string }>
```

Quick pick options (e.g., "24H", "7D", "30D").

#### `disabledDate`

```typescript
disabledDate?: (date: Date) => boolean
```

Function to disable specific dates (e.g., future dates).

#### `format`

```typescript
format?: string
```

Display format. Default: `"YYYY-MM-DD"`.

#### `allowClear`

```typescript
allowClear?: boolean
```

Show clear button.

#### `open`

```typescript
open?: boolean
```

Controlled dropdown state.

#### `onOpenChange`

```typescript
onOpenChange?: (open: boolean) => void
```

Callback when dropdown state changes.

## Usage Examples

### Basic DatePicker

```tsx
import { DatePicker } from "@orderly.network/ui";

<DatePicker
  value={selectedDate}
  onChange={setSelectedDate}
  placeholder="Select date"
/>;
```

### DateRangePicker with Presets

```tsx
import dayjs from "dayjs";
import { DateRangePicker } from "@orderly.network/ui";

<DateRangePicker
  value={range}
  onChange={setRange}
  presets={[
    {
      label: "24H",
      value: [dayjs().subtract(1, "day").toDate(), dayjs().toDate()],
    },
    {
      label: "7D",
      value: [dayjs().subtract(7, "day").toDate(), dayjs().toDate()],
    },
    {
      label: "30D",
      value: [dayjs().subtract(30, "day").toDate(), dayjs().toDate()],
    },
  ]}
  disabledDate={(date) => date > new Date()}
/>;
```

### DatePicker with Custom Format

```tsx
import { DatePicker } from "@orderly.network/ui";

<DatePicker
  value={date}
  onChange={setDate}
  dateFormat="MM/DD/YYYY"
  placeholder="MM/DD/YYYY"
/>;
```

## Implementation Notes

- Pickers use `react-day-picker` for calendar rendering
- DatePicker wraps calendar in a Popover with trigger button
- DateRangePicker supports two-pane selection for start and end dates
- Presets provide quick selection options for common ranges
- Disabled dates are handled via `disabledDate` function

## Integration Tips

1. Sync selected ranges with API queries or chart windows to keep UI and data aligned.
2. Provide tooltips or inline hints for time-zone sensitive data; consider converting values to UTC before submission.
3. On mobile, switch to `Sheet`-based pickers to maintain usability—wrap detection with `useScreen`.
4. Use presets for common date ranges (24H, 7D, 30D) to improve UX.
5. Disable future dates for historical data selection using `disabledDate`.
