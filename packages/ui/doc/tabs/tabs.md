# Tabs Reference

> Location: `packages/ui/src/tabs/tabs.tsx`, `packages/ui/src/tabs/tabsBase.tsx`, `packages/ui/src/tabs/index.ts`

## Overview

Tabs wrap Radix Tabs to provide scrollable tab lists, animated indicators, and consistent spacing. They include exports for `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, and utility hooks that manage indicator placement.

## Source Structure

| File           | Description                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `tabsBase.tsx` | Implements core context, indicator, and shared variants (`TabsBase`, `TabsList`, `TabsTrigger`, `TabsContent`, `tabsVariants`). |
| `tabs.tsx`     | Extends the base with Orderly styling and responsive behavior, plus `Tabs` component with leading/trailing support.             |
| `index.ts`     | Re-exports the API.                                                                                                             |

## Exports & Types

### `Tabs`

```typescript
const Tabs: React.FC<TabsProps>
```

High-level tabs component with leading/trailing support and scroll indicators.

### `TabsBase`

```typescript
const TabsBase: React.ForwardRefExoticComponent<
  TabsBaseProps & React.RefAttributes<HTMLDivElement>
>
```

Base tabs component (Radix wrapper).

### `TabsList`

```typescript
const TabsList: React.ForwardRefExoticComponent<
  TabsListProps & React.RefAttributes<HTMLDivElement>
>
```

Tab list container.

### `TabsTrigger`

```typescript
const TabsTrigger: React.ForwardRefExoticComponent<
  TabsTriggerProps & React.RefAttributes<HTMLButtonElement>
>
```

Individual tab trigger button.

### `TabsContent`

```typescript
const TabsContent: React.ForwardRefExoticComponent<
  TabsContentProps & React.RefAttributes<HTMLDivElement>
>
```

Tab panel content.

### `tabsVariants`

```typescript
const tabsVariants: ReturnType<typeof tv>
```

Tailwind variants for tabs styling.

### `TabsProps`

```typescript
type TabsProps<T = string> = {
  defaultValue?: T;
  value?: T;
  leading?: ReactNode;
  trailing?: ReactNode;
  classNames?: {
    tabsListContainer?: string;
    tabsList?: string;
    tabsContent?: string;
    scrollIndicator?: string;
    trigger?: string;
  };
  contentVisible?: boolean;
  showScrollIndicator?: boolean;
} & TabsPrimitive.TabsProps &
  VariantProps<typeof tabsVariants>;
```

## Props & Behavior

### Tabs Props

Inherits all Radix TabsRoot props:

#### `value`

```typescript
value?: string
```

Controlled selected tab value.

#### `defaultValue`

```typescript
defaultValue?: string
```

Uncontrolled default selected tab value.

#### `onValueChange`

```typescript
onValueChange?: (value: string) => void
```

Callback when selected tab changes.

#### `orientation`

```typescript
orientation?: "horizontal" | "vertical"
```

Tab orientation. Default: `"horizontal"`.

#### `leading`

```typescript
leading?: ReactNode
```

Content to display before the tab list.

#### `trailing`

```typescript
trailing?: ReactNode
```

Content to display after the tab list.

#### `variant`

```typescript
variant?: "text" | "contained"
```

Tab variant. `"text"` shows underline indicator; `"contained"` shows background. Default: `"contained"`.

#### `size`

```typescript
size?: "sm" | "md" | "lg" | "xl"
```

Tab size variant.

#### `contentVisible`

```typescript
contentVisible?: boolean
```

Whether to show tab content. Default: `true`.

#### `showScrollIndicator`

```typescript
showScrollIndicator?: boolean
```

Show scroll indicator for overflow. Default: `false`.

#### `classNames`

```typescript
classNames?: {
  tabsListContainer?: string;
  tabsList?: string;
  tabsContent?: string;
  scrollIndicator?: string;
  trigger?: string;
}
```

Class name overrides.

### TabsTrigger Props

#### `value` (required)

```typescript
value: string;
```

Value for this tab trigger.

#### `size`

```typescript
size?: "sm" | "md" | "lg" | "xl"
```

Trigger size variant.

Inherits all Radix TabsTrigger props.

### TabsContent Props

#### `value` (required)

```typescript
value: string;
```

Value matching the trigger that controls this content.

Inherits all Radix TabsContent props.

## Usage Examples

### Basic Tabs

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@veltodefi/ui";

<Tabs value={tab} onValueChange={setTab}>
  <TabsList>
    <TabsTrigger value="positions">Positions</TabsTrigger>
    <TabsTrigger value="orders">Orders</TabsTrigger>
  </TabsList>
  <TabsContent value="positions">
    <PositionsTable />
  </TabsContent>
  <TabsContent value="orders">
    <OrdersTable />
  </TabsContent>
</Tabs>;
```

### Tabs with Variants

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@veltodefi/ui";

<Tabs value={tab} onValueChange={setTab} variant="text">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>;
```

### Tabs with Leading/Trailing

```tsx
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
} from "@veltodefi/ui";

<Tabs
  value={tab}
  onValueChange={setTab}
  leading={<Button size="sm">Actions</Button>}
  trailing={<Button size="sm">Settings</Button>}
>
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>;
```

### Tabs with Scroll Indicator

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@veltodefi/ui";

<Tabs value={tab} onValueChange={setTab} showScrollIndicator={true}>
  <TabsList>
    {manyTabs.map((tab) => (
      <TabsTrigger key={tab.id} value={tab.id}>
        {tab.label}
      </TabsTrigger>
    ))}
  </TabsList>
  {/* TabsContent */}
</Tabs>;
```

## Implementation Notes

- Tabs use Radix primitives for accessibility and keyboard navigation
- `variant="text"` shows an underline indicator; `variant="contained"` shows background
- Size variants affect trigger height and font size via compound variants
- Scroll indicator is automatically shown when `showScrollIndicator` is `true` and content overflows
- Tabs can be registered via context for programmatic control

## Integration Tips

1. Combine with `ScrollIndicator` for horizontal tab bars containing many items.
2. Use `TabsContent` to mount/unmount panels efficiently; heavy components can lazily load based on the active tab.
3. When mapping tabs to routes, sync `value` with router state and use `TabsTrigger`'s `asChild` to render navigation links.
4. Use `leading` and `trailing` props to add action buttons or filters alongside tabs.
5. Use `variant="text"` for minimal tabs and `variant="contained"` for prominent navigation.
