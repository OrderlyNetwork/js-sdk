# newwidget

创建一个全新的标准 Widget（script/ui/widget/index 四件套），遵循 `specs/002-widget-rules.md` 规范。

## 适用场景

- 从零生成一个标准 Widget 目录，包含四个文件：
  - `${camel}.script.tsx`：逻辑 Hook
  - `${camel}.ui.tsx`：纯 UI 组件
  - `${camel}.widget.tsx`：胶水层（连接 script 与 ui，可选注册 Dialog/Sheet）
  - `index.ts`：统一导出

## 使用方式

### 基本语法

```
创建一个 Widget，他的名称是：<xxxx>
目录：<target_directory>
```

### 参数说明

- **名称**（必填）：组件名称，例如 `positionInfo`、`userPnLCard`
  - 文件夹命名：`camelCase`（如 `positionInfo/`）
  - 组件/类型命名：`PascalCase`（如 `PositionInfo`、`PositionInfoWidget`）
- **目录**（可选）：目标路径，例如 `packages/trading/src/components/mobile/positionInfo`
  - 如未提供，将根据上下文或提示确认

## 示例

### 1. 完整示例（指明目录）

```
创建一个 Widget，他的名称是：positionInfo
目录：packages/trading/src/components/mobile/positionInfo
```

**生成结果**：

```
packages/trading/src/components/mobile/positionInfo/
├── positionInfo.script.tsx    # usePositionInfoScript + PositionInfoState
├── positionInfo.ui.tsx         # PositionInfo 组件 + PositionInfoProps
├── positionInfo.widget.tsx     # PositionInfoWidget（连接 script 与 ui）
└── index.ts                    # 统一导出
```

### 2. 简化示例（未指明目录）

```
创建一个 Widget，他的名称是：userPnLCard
```

我会根据上下文或提示确认目标目录。

### 3. 带 Dialog 注册（可选）

```
创建一个 Widget，他的名称是：fundingDetails
目录：packages/trading/src/components/mobile/fundingDetails
需要注册 Dialog，标题使用 i18n.t("trading.fundingDetails.title")，尺寸 md
```

**说明**：Dialog/Sheet 注册是可选的，如果不需要注册，只需创建基础四件套即可。

## 生成的文件模板

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
// 可选：
// import { i18n } from "@orderly.network/i18n";
// import { registerSimpleDialog, registerSimpleSheet } from "@orderly.network/ui";

export type ${Pascal}WidgetProps = Pick<${Pascal}Props, "className" | "style"> & {
  // Define options passed to script, e.g. symbol?: string
};

export const ${Pascal}Widget: React.FC<${Pascal}WidgetProps> = (props) => {
  const { className, style, ...rest } = props as any;
  const state = use${Pascal}Script(rest);
  return <${Pascal} {...state} className={className} style={style} />;
};

// 可选注册：
// export const ${Pascal}DialogId = "${Pascal}DialogId";
// export const ${Pascal}SheetId = "${Pascal}SheetId";
// registerSimpleDialog(${Pascal}DialogId, ${Pascal}Widget, {
//   size: "md",
//   title: () => i18n.t("..."),
// });
// registerSimpleSheet(${Pascal}SheetId, ${Pascal}Widget, {
//   title: () => i18n.t("..."),
// });
```

### 4) index.ts

```ts
export { ${Pascal}, type ${Pascal}Props } from "./${camel}.ui";
export { use${Pascal}Script, type ${Pascal}State } from "./${camel}.script";
export { ${Pascal}Widget /*, ${Pascal}DialogId, ${Pascal}SheetId */ } from "./${camel}.widget";
```

## 命名约定

- **文件夹**：`camelCase`（如 `fundingRateModal/`）
- **文件名**：`camelCase`（如 `fundingRateModal.script.tsx`）
- **组件**：`PascalCase`（如 `FundingRateModal`）
- **类型**：`PascalCase`（如 `FundingRateModalProps`、`FundingRateModalState`）
- **Hook**：`use${Pascal}Script`（如 `useFundingRateModalScript`）
- **Widget**：`${Pascal}Widget`（如 `FundingRateModalWidget`）

## 职责说明

- **script**：负责数据获取、状态管理、派生计算，不写 JSX
- **ui**：纯展示组件，无内部状态，所有数据从 props 输入，事件通过 props 输出
- **widget**：连接 script 与 ui，将外部 props 传给 script，把 state 传给 ui；可选注册 Dialog/Sheet
- **index**：统一导出所有组件、类型与 ID

## 最佳实践

- UI 不做副作用，保持纯函数
- 逻辑与派生计算放在 script，使用 `useMemo`/`useCallback` 优化性能
- 文本建议使用 i18n 国际化
- 类型显式声明，避免深层嵌套
- 必要时做错误兜底处理
- **数字计算**：所有涉及数字计算（乘法、除法、百分比转换等）必须使用 `Decimal`（来自 `@orderly.network/utils`），避免 JavaScript 浮点数精度问题
- **注释语言**：所有代码注释必须使用英文
- **禁止生成任何类型的 Markdown 文档**：不要生成 README、CHANGELOG、使用说明、总结文档等任何 .md 文件
- **多语言 Key 处理流程**：
  1. 先在 `@orderly.network/i18n` 包中查找是否已存在匹配的 key
  2. 如果存在就直接使用，如果不存在则需要创建新的 key
  3. 根据内容性质判断应该放在 `packages/i18n/src/locale/module/` 下的哪个文件：
     - 通用文本（如 Cancel、Confirm、Save 等）→ `common.ts`
     - 仓位相关 → `positions.ts`
     - 交易相关 → `trading.ts`
     - 订单相关 → `orders.ts`
     - 其他模块类推
  4. Key 的命名格式：`module.keyName`（如 `common.cancel`、`positions.closeAll`）
  5. **仅添加 key 到对应的 .ts 文件，不要翻译到其他语言的 json 文件中**
- **确认机制**：对于需要确认的部分（如不确定放置位置、不确定实现方式等），必须暂停并询问用户意见后才可以继续开发

## 参考

- 规范详见：`specs/002-widget-rules.md`
- 参考实现：`packages/trading/src/components/mobile/fundingRateModal/`
