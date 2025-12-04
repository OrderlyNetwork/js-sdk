# editwidget

Command instructions for editing/creating standard Widgets (script/ui/widget/index). This command follows the rules and templates in `specs/002-widget-rules.md`.

## Target Objects

- Target directory contains the "standard Widget four-piece set": `xxx.script.tsx`, `xxx.ui.tsx`, `xxx.widget.tsx`, `index.ts`

## Executable Actions

1. "Add X and use in Y" in an existing standard Widget
2. Create a brand new standard Widget (generate four-piece template)

## Usage (Natural language is acceptable)

### A. Add fields/logic in standard Widget and use in UI

- Syntax:
  - This is a standard Widget: `<folder>`.
  - Add `<X>`, use in `<Y>`.
- Behavior:
  - In `<folder>/<name>.script.tsx`, implement or extend logic in `use${Pascal}Script`, add field `X` and include it in the return object; if external parameters are needed, extend `Use${Pascal}ScriptOptions` and input parameters.
  - In `<folder>/<name>.ui.tsx`, ensure `${Pascal}Props` covers `X`, and render/use it at position `Y` in the UI.
  - If external input parameters need to be passed through, extend `WidgetProps` in `<folder>/<name>.widget.tsx` and pass options to `use${Pascal}Script`.
  - If there are new exports, update `<folder>/index.ts`.

### B. Create a brand new standard Widget

- Syntax:
  - Create a Widget, its name is: `<xxxx>`.
  - Directory: `<dir>`. (If directory is not provided, it will be confirmed based on context or prompts)
- Behavior:
  - Create folder under `<dir>`: `camelCase(xxxx)`; use `PascalCase(xxxx)` for component and type names in code.
  - Generate four-piece set:
    - `${camel}.script.tsx`: `use${Pascal}Script` and `type ${Pascal}State = ReturnType<typeof use${Pascal}Script>`
    - `${camel}.ui.tsx`: `${Pascal}` component and `${Pascal}Props`
    - `${camel}.widget.tsx`: `${Pascal}Widget` connects script and ui (optionally register Dialog/Sheet)
    - `index.ts`: Unified export of UI/Widget/Script and types

## Examples (Can be copied and modified directly)

### Add X, use in Y

1. Simplest:
   - This is a standard Widget: `packages/trading/src/components/mobile/fundingRateModal/`.
   - Add `countDown`, use in the top right of the UI.

2. With external input parameters:
   - This is a standard Widget: `packages/trading/src/components/mobile/fundingRateModal/`.
   - Add field `nextFundingTime` (from options: `symbol: string`), use in the bottom hint text.

3. Add event:
   - This is a standard Widget: `packages/trading/src/components/mobile/someWidget/`.
   - Add `onSubmit: () => void`, use on bottom confirm button click.

4. Add Dialog/Sheet registration:
   - This is a standard Widget: `packages/trading/src/components/mobile/someWidget/`.
   - Add Dialog and Sheet registration, define and export `${Pascal}DialogId` and `${Pascal}SheetId`, register using `registerSimpleDialog` and `registerSimpleSheet`.

### Create Widget (four-piece set)

1. Specify directory:
   - Create a Widget, its name is: `positionInfo`.
   - Directory: `packages/trading/src/components/mobile/positionInfo`.

2. Directory not specified (confirm based on context/prompts):
   - Create a Widget, its name is: `userPnLCard`.

## Constraints and Defaults

- UI is pure presentation, no side effects; layout-related `className`/`style` can be passed.
- Logic and derived calculations go in `script`; Dialog/Sheet registration goes in `widget`.
- **Responsibility Separation**:
  - **Script**: Responsible for data logic and business logic. Script only provides raw state/data (numbers, booleans, objects, etc.), does NOT handle internationalization (i18n), does NOT preset UI display format. Script returns raw values, and UI decides how to display them (including i18n text selection and formatting).
  - **UI**: Responsible for display logic and translation (i18n). UI receives raw data from script and handles all formatting, translation, and presentation concerns.
- Naming: files use `camelCase`, components/types use `PascalCase`.
- **Dialog/BottomSheet Registration Requirements**: If the created Widget needs to be used as a Dialog or BottomSheet, you must:
  1. Define and export `${Pascal}DialogId` and `${Pascal}SheetId` (or `${Pascal}BottomSheetId`) constants in `widget.tsx`
  2. Register using `registerSimpleDialog` and `registerSimpleSheet` (from `@orderly.network/ui`)
  3. Export these IDs in `index.ts`
  4. Reference example: `packages/ui-tpsl/src/editBracketOrder/editBracketOrder.widget.tsx`
- Text should use i18n (only in UI layer, NOT in script); add error fallbacks and `useMemo` optimization when necessary.
- **Numeric Calculations**: All numeric calculations (multiplication, division, percentage conversion, etc.) must use `Decimal` (from `@orderly.network/utils`) to avoid floating-point precision issues.
- **Local Cache Data**: When local cache data is needed, must use `useLocalStorage` hook (from `@orderly.network/hooks`). Use in `script.tsx`, usage: `const [storedValue, setValue] = useLocalStorage<T>(key: string, initialValue: T)`. Do not directly use `localStorage.getItem/setItem`.
- **Comment Language**: All code comments must be in English.
- **Prohibit Generating Any Type of Markdown Documentation**: Do not generate README, CHANGELOG, usage instructions, summary documents, or any .md files.
- **i18n Key Processing Workflow** (only applies to UI layer):
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
  6. **Important**: i18n should only be used in `ui.tsx`, NOT in `script.tsx`. Script provides state, UI decides how to display it.
- **Confirmation Mechanism**: For parts that need confirmation (such as uncertain placement location, uncertain implementation method, etc.), must pause and ask for user opinion before continuing development.
- **Component Reusability**: If the created View or Node components can be reused in other places, they should be extracted as reusable components. Before creating new components, check if similar components already exist in the codebase that can be reused or extended. Extract common UI patterns into separate components for better maintainability and consistency.

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

## UI Component Best Practices

- **Displaying Symbol with Icon**: When UI needs to display a trading symbol with icon and formatted text, use `Text.formatted` component:

  ```tsx
  <Text.formatted
    size="base"
    weight="semibold"
    rule="symbol"
    formatString="base-type"
    showIcon
  >
    {symbol}
  </Text.formatted>
  ```

  This component automatically handles icon display and symbol formatting. Script should only provide the raw `symbol` string (e.g., `"PERP_ETH_USDC"`), and UI uses `Text.formatted` to render it with icon and proper formatting.

- **Displaying Statistics (Label + Value)**: When UI needs to display a vertical layout with a text label on top and a numeric value below, use `Statistic` component:
  ```tsx
  <Statistic
    label={i18n.t("portfolio.totalBalance")}
    valueProps={{ rule: "price", dp: 2, coloring: true }}
  >
    {balance}
  </Statistic>
  ```
  This component automatically handles label/value styling and number formatting. Script should only provide the raw numeric value (e.g., `12345.67`), and UI uses `Statistic` to render it with proper label and formatting. The `valueProps` can be used to configure number formatting rules (e.g., `rule: "price"`, `rule: "percentages"`), decimal places (`dp`), coloring, and other `Numeral` component props.

## References

- Rules and templates: `specs/002-widget-rules.md`
- Component index: `packages/ui/doc/components.md`
