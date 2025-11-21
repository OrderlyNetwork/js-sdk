# newwidget

Create a brand new standard Widget (script/ui/widget/index four-piece set), following `specs/002-widget-rules.md` specifications.

## Applicable Scenarios

- Generate a standard Widget directory from scratch, containing four files:
  - `${camel}.script.tsx`: Logic Hook
  - `${camel}.ui.tsx`: Pure UI component
  - `${camel}.widget.tsx`: Glue layer (connects script and ui, optionally registers Dialog/Sheet)
  - `index.ts`: Unified export

## Usage

### Basic Syntax

```
Create a Widget, its name is: <xxxx>
Directory: <target_directory>
```

### Parameter Description

- **Name** (required): Component name, e.g., `positionInfo`, `userPnLCard`
  - Folder naming: `camelCase` (e.g., `positionInfo/`)
  - Component/type naming: `PascalCase` (e.g., `PositionInfo`, `PositionInfoWidget`)
- **Directory** (optional): Target path, e.g., `packages/trading/src/components/mobile/positionInfo`
  - If not provided, will be confirmed based on context or prompts

## Examples

### 1. Complete Example (Specify Directory)

```
Create a Widget, its name is: positionInfo
Directory: packages/trading/src/components/mobile/positionInfo
```

**Generated Result**:

```
packages/trading/src/components/mobile/positionInfo/
├── positionInfo.script.tsx    # usePositionInfoScript + PositionInfoState
├── positionInfo.ui.tsx         # PositionInfo component + PositionInfoProps
├── positionInfo.widget.tsx     # PositionInfoWidget (connects script and ui)
└── index.ts                    # Unified export
```

### 2. Simplified Example (Directory Not Specified)

```
Create a Widget, its name is: userPnLCard
```

I will confirm the target directory based on context or prompts.

### 3. With Dialog/Sheet Registration (Optional)

```
Create a Widget, its name is: fundingDetails
Directory: packages/trading/src/components/mobile/fundingDetails
Need to register Dialog and Sheet, Dialog title uses i18n.t("trading.fundingDetails.title"), size md
```

**Note**: Dialog/Sheet registration is optional. If registration is not needed, just create the basic four-piece set. **However, if registration is needed, DialogId and SheetId must be defined and exported, and registration must be performed.**

## Generated File Templates

### 1) ${camel}.script.tsx

```ts
import { useMemo } from "react";
import { Decimal } from "@orderly.network/utils";

export interface Use${Pascal}ScriptOptions {
  // Define external inputs, e.g. symbol?: string
}

export const use${Pascal}Script = (options?: Use${Pascal}ScriptOptions) => {
  const value = useMemo(() => {
    return "-";
  }, []);

  // Example: Use Decimal for all numeric calculations
  const percentage = useMemo(() => {
    const rate = 0.0001;
    return `${new Decimal(rate).mul(100).toNumber()}%`;
  }, []);

  return {
    value,
    percentage,
  };
};

export type ${Pascal}State = ReturnType<typeof use${Pascal}Script>;
```

### 2) ${camel}.ui.tsx

```tsx
import React, { FC } from "react";
import { Flex, Text } from "@orderly.network/ui";
import type { ${Pascal}State } from "./${camel}.script";

export type ${Pascal}Props = ${Pascal}State & {
  className?: string;
  style?: React.CSSProperties;
};

export const ${Pascal}: FC<${Pascal}Props> = (props) => {
  const { className, style } = props;
  return (
    <Flex className={className} style={style}>
    </Flex>
  );
};
```

### 3) ${camel}.widget.tsx

```tsx
import React from "react";
import { ${Pascal}, type ${Pascal}Props } from "./${camel}.ui";
import { use${Pascal}Script } from "./${camel}.script";
// If Dialog/Sheet registration is needed, uncomment below:
// import { registerSimpleDialog, registerSimpleSheet } from "@orderly.network/ui";
// import { i18n } from "@orderly.network/i18n";

export type ${Pascal}WidgetProps = Pick<${Pascal}Props, "className" | "style"> & {
  // Define options passed to script, e.g. symbol?: string
};

export const ${Pascal}Widget: React.FC<${Pascal}WidgetProps> = (props) => {
  const { className, style, ...rest } = props as any;
  const state = use${Pascal}Script(rest);
  return <${Pascal} {...state} className={className} style={style} />;
};

// If Dialog/Sheet registration is needed, must define and export IDs, then register:
// export const ${Pascal}DialogId = "${Pascal}DialogId";
// export const ${Pascal}SheetId = "${Pascal}SheetId";
//
// registerSimpleSheet(${Pascal}SheetId, ${Pascal}Widget);
//
// registerSimpleDialog(${Pascal}DialogId, ${Pascal}Widget, {
//   classNames: {
//     content: "oui-w-[420px]",
//   },
// });
```

### 4) index.ts

```ts
export { ${Pascal}, type ${Pascal}Props } from "./${camel}.ui";
export { use${Pascal}Script, type ${Pascal}State } from "./${camel}.script";
export { ${Pascal}Widget /*, ${Pascal}DialogId, ${Pascal}SheetId */ } from "./${camel}.widget";
// If Dialog/Sheet is registered, uncomment above to export IDs
```

## Naming Conventions

- **Folder**: `camelCase` (e.g., `fundingRateModal/`)
- **File name**: `camelCase` (e.g., `fundingRateModal.script.tsx`)
- **Component**: `PascalCase` (e.g., `FundingRateModal`)
- **Type**: `PascalCase` (e.g., `FundingRateModalProps`, `FundingRateModalState`)
- **Hook**: `use${Pascal}Script` (e.g., `useFundingRateModalScript`)
- **Widget**: `${Pascal}Widget` (e.g., `FundingRateModalWidget`)

## Responsibility Description

- **script**: Responsible for data fetching, state management, derived calculations, no JSX
- **ui**: Pure presentation component, no internal state, all data from props input, events through props output
- **widget**: Connects script and ui, passes external props to script, passes state to ui; optionally registers Dialog/Sheet
- **index**: Unified export of all components, types, and IDs

## Best Practices

- UI does no side effects, keep pure functions
- Logic and derived calculations go in script, use `useMemo`/`useCallback` for performance optimization
- Text should use i18n for internationalization
- Types should be explicitly declared, avoid deep nesting
- Add error fallback handling when necessary
- **Numeric Calculations**: All numeric calculations (multiplication, division, percentage conversion, etc.) must use `Decimal` (from `@orderly.network/utils`) to avoid JavaScript floating-point precision issues
- **Local Cache Data**: When local cache data is needed, must use `useLocalStorage` hook (from `@orderly.network/hooks`). Use in `script.tsx`, usage: `const [storedValue, setValue] = useLocalStorage<T>(key: string, initialValue: T)`. Do not directly use `localStorage.getItem/setItem`
- **Comment Language**: All code comments must be in English
- **Prohibit Generating Any Type of Markdown Documentation**: Do not generate README, CHANGELOG, usage instructions, summary documents, or any .md files
- **i18n Key Processing Workflow**:
  1. First search in `@orderly.network/i18n` package to see if a matching key already exists
  2. If it exists, use it directly; if not, create a new key
  3. Determine which file it should be placed in under `packages/i18n/src/locale/module/` based on content nature:
     - Common text (such as Cancel, Confirm, Save, etc.) → `common.ts`
     - Position-related → `positions.ts`
     - Trading-related → `trading.ts`
     - Order-related → `orders.ts`
     - Other modules follow the same pattern
  4. Key naming format: `module.keyName` (e.g., `common.cancel`, `positions.closeAll`)
  5. **Only add key to the corresponding .ts file, do not translate to other language json files**
- **Confirmation Mechanism**: For parts that need confirmation (such as uncertain placement location, uncertain implementation method, etc.), must pause and ask for user opinion before continuing development
- **Dialog/BottomSheet Registration Requirements**: If the created Widget needs to be used as a Dialog or BottomSheet, must:
  1. Define and export `${Pascal}DialogId` and `${Pascal}SheetId` (or `${Pascal}BottomSheetId`) constants in `widget.tsx`
  2. Register using `registerSimpleDialog` and `registerSimpleSheet` (from `@orderly.network/ui`)
  3. Export these IDs in `index.ts` so external code can call Dialog/Sheet by ID
  4. Reference example: `packages/ui-tpsl/src/editBracketOrder/editBracketOrder.widget.tsx`

## Component Usage Workflow

When components need to be used in UI (especially component names obtained from Figma MCP), the following workflow must be followed:

1. **Get Component Name**: Get component name from Figma MCP or other design tools (e.g., `Button`, `Input`, `Card`, etc.)

2. **Search Component Index**: Search for the component in `packages/ui/doc/components.md`
   - Confirm if the component exists
   - Understand the component's basic description and export information

3. **Read Detailed Documentation**: Read the corresponding detailed documentation based on component name
   - Example: `Button` → `packages/ui/doc/button/button.md`
   - Example: `Input` → `packages/ui/doc/input/input.md`
   - Get the component's complete API, props, variants, usage examples, etc.

4. **Use When Generating UI**:
   - Use components according to the API and best practices in the documentation
   - Use correct import paths (e.g., `import { Button } from "@orderly.network/ui"`)
   - Apply correct props, variants, and style configurations
   - Follow usage examples and notes in the documentation

**Important**: Do not directly guess the component's API, must confirm the component's correct usage through documentation.

## References

- Specifications: `specs/002-widget-rules.md`
- Reference implementation: `packages/trading/src/components/mobile/fundingRateModal/`
- Component index: `packages/ui/doc/components.md`
