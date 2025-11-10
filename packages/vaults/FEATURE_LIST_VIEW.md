# All Vaults 列表视图功能

## 功能概述

为 All Vaults 添加了列表模式视图，用户可以在卡片模式和列表模式之间切换。

## 新增文件

### 1. `view-mode-toggle.tsx`

视图模式切换组件，支持在网格（grid）和列表（list）模式之间切换。

**特性：**

- 两个切换按钮（网格图标和列表图标）
- 当前激活的模式会高亮显示
- 使用简洁的 SVG 图标

### 2. `vaults-list.tsx`

列表视图组件，以表格形式展示 vaults 信息。

**特性：**

- 默认按 APY 从高到低排序
- 支持按以下字段排序：
  - TVL
  - APR (30天 APY)
  - My deposits（我的存款）
  - All-time PnL（历史收益）
- 每个列表项包含以下信息：
  - Pool Name（矿池名称）+ 图标
  - TVL（总锁仓价值）
  - APR（年化收益率）
  - My deposits（我的存款）
  - All-time PnL（历史收益）
  - Account balance（账户余额）
  - Operate（操作按钮：Deposit/Withdraw）
- 点击排序图标可切换升序/降序
- 排序图标会显示当前排序状态

## 修改文件

### 1. `all-vaults.desktop.tsx`

- 添加了视图模式状态管理
- 根据当前视图模式渲染不同的组件
- 在标题栏右侧添加了视图切换按钮

### 2. 国际化文件

**packages/i18n/locales/en.json**

- 添加了 `vaults.list.poolName`
- 添加了 `vaults.list.apr`
- 添加了 `vaults.list.myDeposits`
- 添加了 `vaults.list.allTimePnl`
- 添加了 `vaults.list.operate`

**packages/i18n/locales/zh.json**

- 添加了对应的中文翻译

## 使用方式

用户可以通过点击 "All vaults" 标题右侧的切换按钮在两种视图模式之间切换：

- **网格模式（Grid）**：卡片式展示（原有功能）
- **列表模式（List）**：表格式展示（新增功能）

## 技术实现

### 排序功能

- 使用 React `useState` 管理排序字段和方向
- 使用 `useMemo` 优化排序性能
- 支持升序/降序切换

### 复用逻辑

- 列表视图复用了 `useVaultCardScript` hook
- 保持了与卡片视图相同的数据获取和操作逻辑
- 确保两种视图展示的数据一致

### 响应式设计

- 使用 Tailwind CSS 的 grid 布局
- 自适应列宽配置：`grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1.5fr]`
- 保持与设计稿一致的视觉效果

## 注意事项

- 列表模式仅在桌面端（Desktop）可用
- 移动端仍然使用原有的卡片布局
- 排序状态在视图切换时会保持
