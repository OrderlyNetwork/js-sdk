# editwidget

面向标准 Widget（script/ui/widget/index）的编辑/创建命令说明。此命令遵循 `specs/002-widget-rules.md` 中的规则与模板。

## 适用对象

- 目标目录为“标准 Widget 四件套”：`xxx.script.tsx`、`xxx.ui.tsx`、`xxx.widget.tsx`、`index.ts`

## 可执行动作

1. 在既有标准 Widget 中“新增 X，并用在 Y”
2. 创建一个全新的标准 Widget（生成四件套模板）

## 使用方式（自然语言即可）

### A. 标准 Widget 下新增字段/逻辑并在 UI 使用

- 句式：
  - 这是标准 Widget：`<folder>`。
  - 新增 `<X>`，用在 `<Y>`。
- 行为：
  - 在 `<folder>/<name>.script.tsx` 的 `use${Pascal}Script` 中实现或扩展逻辑，新增字段 `X` 并加入返回对象；如需外部参数，扩展 `Use${Pascal}ScriptOptions` 和入参。
  - 在 `<folder>/<name>.ui.tsx` 中确保 `${Pascal}Props` 覆盖 `X`，并在 UI 的 `Y` 位置渲染/使用。
  - 如需透传外部入参，在 `<folder>/<name>.widget.tsx` 扩展 `WidgetProps` 并把 options 传入 `use${Pascal}Script`。
  - 如有新导出项，更新 `<folder>/index.ts`。

### B. 创建一个全新的标准 Widget

- 句式：
  - 创建一个 Widget，他的名称是：`<xxxx>`。
  - 目录：`<dir>`。（如未提供目录，将按上下文或提示确认）
- 行为：
  - 在 `<dir>` 下创建文件夹：`camelCase(xxxx)`；在代码中使用 `PascalCase(xxxx)` 命名组件与类型。
  - 生成四件套：
    - `${camel}.script.tsx`：`use${Pascal}Script` 与 `type ${Pascal}State = ReturnType<typeof use${Pascal}Script>`
    - `${camel}.ui.tsx`：`${Pascal}` 组件与 `${Pascal}Props`
    - `${camel}.widget.tsx`：`${Pascal}Widget` 连接 script 与 ui（可选注册 Dialog/Sheet）
    - `index.ts`：统一导出 UI/Widget/Script 及类型

## 示例（可直接复制修改）

### 新增 X，用在 Y

1. 最简：
   - 这是标准 Widget：`packages/trading/src/components/mobile/fundingRateModal/`。
   - 新增 `countDown`，用在 UI 顶部右侧。

2. 含外部入参：
   - 这是标准 Widget：`packages/trading/src/components/mobile/fundingRateModal/`。
   - 新增字段 `nextFundingTime`（来自 options：`symbol: string`），用在底部提示文本中。

3. 新增事件：
   - 这是标准 Widget：`packages/trading/src/components/mobile/someWidget/`。
   - 新增 `onSubmit: () => void`，用在底部确认按钮点击。

### 创建 Widget（四件套）

1. 指明目录：
   - 创建一个 Widget，他的名称是：`positionInfo`。
   - 目录：`packages/trading/src/components/mobile/positionInfo`。

2. 未指明目录（按上下文/提示确认）：
   - 创建一个 Widget，他的名称是：`userPnLCard`。

## 约束与默认

- UI 纯展示，无副作用；布局类 `className`/`style` 可传递。
- 逻辑与派生计算放 `script`；注册 Dialog/Sheet 放 `widget`。
- 命名：文件用 `camelCase`，组件/类型用 `PascalCase`。
- 文本建议走 i18n；必要时做错误兜底与 `useMemo` 优化。
- **数字计算**：所有涉及数字计算（乘法、除法、百分比转换等）必须使用 `Decimal`（来自 `@orderly.network/utils`），避免浮点数精度问题。
- **注释语言**：所有代码注释必须使用英文。

## 参考

- 规则与模板详见：`specs/002-widget-rules.md`
