---
name: widget-standard.mdc
description: 标准 Widget（script/ui/widget/index）结构与协作规则与指令动作（新增X/用在Y、创建Widget）
globs: **/*.{ts,tsx}
---

<!-- 893b7c39-33f8-40bc-979b-fa57e714d8ab 1f961a9c-5316-4e1a-9caf-0338c0b2ecaf -->

## Widget 开发规范（script/ui/widget/index）

### 目标

在 `specs/002-widget-rules.md` 建立统一的 Widget 规范与模板，确保：职责清晰、命名一致、数据单向流动、易于复用与注册弹窗/抽屉。

### 目录与命名

- **文件夹命名**：小驼峰，例如 `fundingRateModal/`
- **四个文件**：
  - `example.script.tsx`：逻辑 Hook（不写 JSX）
  - `example.ui.tsx`：纯 UI（无内部状态管理）
  - `example.widget.tsx`：胶水层（组合 script+ui，可选注册 Dialog/Sheet）
  - `index.ts`：统一导出
- **命名规范（帕斯卡命名）**：`Example`、`useExampleScript`、`ExampleState`、`ExampleProps`、`ExampleWidget`

### 职责边界

- **script（逻辑）**：
  - 只负责数据获取、状态管理、派生计算，产出 UI 需要的全部字段
  - 返回值类型：`ReturnType<typeof useExampleScript>`（约定为 `ExampleState`）
  - 可接收 options：`UseExampleScriptOptions`
- **ui（展示）**：
  - 纯函数组件，仅通过 props 渲染；不直接调用业务 hooks
  - 可额外接受 `className`、`style`
- **widget（胶水）**：
  - 负责把外部 props（尤其是 script 的 options）传入 script，再把 state 传给 UI
  - 可在此处注册 `Dialog/Sheet`，设置标题与样式
- **index（导出）**：
  - 统一导出 UI/Widget/Script 与相关类型

### 数据与类型约定

- `ExampleState = ReturnType<typeof useExampleScript>`
- `ExampleProps = ExampleState & { className?: string; style?: React.CSSProperties }`
- UI 只消费 `ExampleProps`；Widget 仅选择性暴露 UI 布局类 props，并把剩余参数作为 script 的 options 传入

### 弹窗/抽屉注册（可选）

- 注册放在 `example.widget.tsx`
- ID 命名：`ExampleDialogId`、`ExampleSheetId`
- 标题：使用 i18n，如 `i18n.t("...")`
- 参考实现：

```12:23:/Users/pgq/orderly/prjects/web/orderly-web/packages/trading/src/components/mobile/fundingRateModal/fundingRateModal.widget.tsx
export const FundingRateDialogId = "FundingRateDialogId";
export const FundingRateSheetId = "FundingRateSheetId";

registerSimpleDialog(FundingRateDialogId, FundingRateModalWidget, {
  size: "md",
  classNames: { content: "oui-border oui-border-line-6" },
  title: () => i18n.t("funding.fundingRate"),
});

registerSimpleSheet(FundingRateSheetId, FundingRateModalWidget, {
  title: () => i18n.t("funding.fundingRate"),
});
```

### 代码风格

- UI 不做数据副作用与状态；逻辑与派生放在 script
- 类型显式、易读命名；避免深层嵌套
- 合理使用 `useMemo/useCallback` 优化计算；必要时进行错误兜底
- **数字计算**：所有涉及数字计算的部分（乘法、除法、百分比转换等）必须使用 `Decimal`（来自 `@orderly.network/utils`），避免 JavaScript 浮点数精度问题
- **注释语言**：所有代码注释必须使用英文

### 指令驱动动作

- 当用户声明“这是标准结构的 Widget，并说：新增『X』，用在『Y』”时：
  1. 编辑对应目录下的 `xxx.script.tsx`：在 `use${Pascal}Script` 中实现或扩展逻辑，新增字段 `X` 并加入返回对象；如需外部参数，扩展 `Use${Pascal}ScriptOptions` 并调整入参。
  2. 编辑 `xxx.ui.tsx`：确保 `${Pascal}Props` 覆盖 `X`；在 UI 的『Y』位置使用该字段/能力；保持 UI 无副作用。
  3. 如需透传外部入参，在 `xxx.widget.tsx` 扩展 `WidgetProps`，将 options 传入 `use${Pascal}Script`，并把 `className`、`style` 继续传给 UI。
  4. 如有新增导出，更新 `index.ts`。

- 当用户说“创建一个 Widget，他的名称是：`xxxx`（目标目录：`<dir>`）”时：
  1. 在 `<dir>` 下创建文件夹：`camelCase(xxxx)`；`PascalCase(xxxx)` 用于组件/类型命名。
  2. 生成四文件：
     - `${camel}.script.tsx`：基于模板创建 `use${Pascal}Script` 与 `${Pascal}State`
     - `${camel}.ui.tsx`：创建 `${Pascal}` 与 `${Pascal}Props`
     - `${camel}.widget.tsx`：创建 `${Pascal}Widget` 并连接 script 与 ui（可选注册 Dialog/Sheet）
     - `index.ts`：统一导出 UI/Widget/Script 与类型
  3. 模板与命名规则见下方“四文件模板”。

### 交互示例（如何描述你的需求）

- 标准 Widget 下新增字段并使用：
  - 示例 1（最简）：
    - 这是标准 Widget：`packages/trading/src/components/mobile/fundingRateModal/`。
    - 新增 `countDown`，用在 UI 顶部右侧。
  - 示例 2（带入参）：
    - 这是标准 Widget：`packages/trading/src/components/mobile/fundingRateModal/`。
    - 新增字段 `nextFundingTime`（来自外部 options：`symbol: string`），用在底部提示文本中。

- 创建一个全新的标准 Widget：
  - 示例 1（指明目录）：
    - 创建一个 Widget，他的名称是：`positionInfo`。
    - 目录：`packages/trading/src/components/mobile/positionInfo`。
  - 示例 2（带默认目录约定）：
    - 创建一个 Widget，他的名称是：`userPnLCard`。
    - 若未提供目录，默认使用当前你提供的组件目录或让我追问确认。

- 事件/交互能力（从 UI 向外抛出）：
  - 在标准 Widget：`.../someWidget/` 中新增 `onSubmit: () => void`，用在底部按钮的点击事件。
  - 按规则：在 `xxx.script.tsx` 中定义回调签名并放入返回对象；在 `xxx.ui.tsx` 的对应按钮上透传调用。

- Dialog/Sheet 注册（可选）：
  - 在 `.../someWidget/` 中注册一个 Dialog，标题使用 `i18n.t("trading.some.title")`，尺寸 `md`。
  - 我会在 `xxx.widget.tsx` 中补充 `registerSimpleDialog` 并导出 `SomeDialogId`。

- 默认约定（未指明时）：
  - 目录：我会请求确认或按最近上下文目录处理。
  - 命名：文件使用 `camelCase` 前缀（`xxx.ui.tsx` 等），类型/组件使用 `PascalCase`（`Xxx`, `XxxWidget` 等）。

### 四文件模板（可复制粘贴）

#### 1) example.script.tsx（逻辑 Hook）

```ts
import { useMemo } from "react";
import { Decimal } from "@orderly.network/utils";

export interface UseExampleScriptOptions {
  // Define external inputs, e.g. symbol?: string
}

export const useExampleScript = (options?: UseExampleScriptOptions) => {
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

export type ExampleState = ReturnType<typeof useExampleScript>;
```

#### 2) example.ui.tsx（纯 UI）

```tsx
import React, { FC } from "react";
import { Flex, Text } from "@orderly.network/ui";
import type { ExampleState } from "./example.script";

export type ExampleProps = ExampleState & {
  className?: string;
  style?: React.CSSProperties;
};

export const Example: FC<ExampleProps> = (props) => {
  const { className, style } = props;
  return <Flex className={className} style={style}></Flex>;
};
```

#### 3) example.widget.tsx（胶水 + 可选注册）

```tsx
import React from "react";
import { useExampleScript } from "./example.script";
import { Example, type ExampleProps } from "./example.ui";

// 可选：
// import { i18n } from "@orderly.network/i18n";
// import { registerSimpleDialog, registerSimpleSheet } from "@orderly.network/ui";

export type ExampleWidgetProps = Pick<ExampleProps, "className" | "style"> & {
  // 这里定义传给 script 的 options，例如 symbol?: string
};

export const ExampleWidget: React.FC<ExampleWidgetProps> = (props) => {
  const { className, style, ...rest } = props as any;
  const state = useExampleScript(rest);
  return <Example {...state} className={className} style={style} />;
};

// 可选注册：
// export const ExampleDialogId = "ExampleDialogId";
// export const ExampleSheetId = "ExampleSheetId";
// registerSimpleDialog(ExampleDialogId, ExampleWidget, {
//   size: "md",
//   title: () => i18n.t("..."),
// });
// registerSimpleSheet(ExampleSheetId, ExampleWidget, {
//   title: () => i18n.t("..."),
// });
```

#### 4) index.ts（统一导出）

```ts
export { Example, type ExampleProps } from "./example.ui";
export { useExampleScript, type ExampleState } from "./example.script";
export {
  ExampleWidget /*, ExampleDialogId, ExampleSheetId */,
} from "./example.widget";
```

### 与 Flutter 生成器的对应规则（用于外部工具生成）

- **文件名**：`PascalCase(组件名)` 用于类型/组件；`camelCase(文件名)` 用于物理文件
- **四文件落盘名称**：`${camel}.ui.tsx`、`${camel}.script.tsx`、`${camel}.widget.tsx`、`index.ts`
- **类型/组件名称**：`${Pascal}`、`use${Pascal}Script`、`${Pascal}State`、`${Pascal}Props`、`${Pascal}Widget`
