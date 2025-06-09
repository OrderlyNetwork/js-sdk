# Rewards Calculation Module

这个模块提供了计算估计奖励(Estimated rewards)和估计票据(Estimated tickets earned)的功能。

## 功能特性

### 1. 奖励估算 (Estimated Rewards)

- 支持多个奖池配置
- 支持基于交易量(volume)和盈亏(PnL)的不同指标
- 支持固定位置奖励和位置范围奖励
- 自动估算用户排名并计算相应奖励

### 2. 票据估算 (Estimated Tickets)

- 支持阶梯模式(tiered mode): 根据不同交易量阶梯给予不同票数
- 支持线性模式(linear mode): 每X交易量获得Y张票据

## 类型定义

### 奖池配置 (Prize Pool)

```typescript
interface PrizePool {
  pool_id: string; // 奖池ID
  label: string; // 奖池标签
  total_prize: number; // 总奖金
  currency: string; // 奖励货币
  metric: "volume" | "pnl"; // 评估指标
  tiers: PrizePoolTier[]; // 层级配置
}
```

### 票据规则 (Ticket Rules)

```typescript
interface TicketRules {
  total_prize: number; // 总票据奖金
  currency: string; // 货币
  metric: "volume" | "pnl"; // 评估指标
  mode: "tiered" | "linear"; // 模式
  tiers?: TicketTierRule[]; // 阶梯模式配置
  linear?: TicketLinearRule; // 线性模式配置
}
```

## 使用示例

### 基本使用

```typescript
import {
  calculateEstimatedRewards,
  calculateEstimatedTickets,
  CampaignConfig,
  UserData,
} from "./utils";

const userdata: UserData = {
  account_id: "user_001",
  trading_volume: 50000,
  pnl: 1500,
  current_rank: 5,
  total_participants: 1000,
};

const campaign: CampaignConfig = {
  // ... campaign configuration
};

// 计算估计奖励
const rewards = calculateEstimatedRewards(userdata, campaign);
console.log(`Estimated rewards: ${rewards?.amount} ${rewards?.currency}`);

// 计算估计票据
if (campaign.ticket_rules) {
  const tickets = calculateEstimatedTickets(userdata, campaign.ticket_rules);
  console.log(`Estimated tickets: ${tickets}`);
}
```

### 在React组件中使用

```typescript
import { RewardsDesktopUI } from './rewards.desktop.ui';

function MyComponent() {
  return (
    <RewardsDesktopUI
      campaign={campaignConfig}
      userdata={userData}
    />
  );
}
```

## 配置示例

### 阶梯模式票据配置

```typescript
ticket_rules: {
  total_prize: 2000,
  currency: "WIF",
  metric: "volume",
  mode: "tiered",
  tiers: [
    { value: 25000, tickets: 10 }, // ≥ 25,000 volume → 10 tickets
    { value: 10000, tickets: 5 },  // ≥ 10,000 volume → 5 tickets
    { value: 5000, tickets: 1 }    // ≥ 5,000 volume → 1 ticket
  ]
}
```

### 线性模式票据配置

```typescript
ticket_rules: {
  total_prize: 1000,
  currency: "WIF",
  metric: "volume",
  mode: "linear",
  linear: {
    every: 5000, // 每5000交易量
    tickets: 1   // 获得1张票据
  }
}
```

### 奖池配置示例

```typescript
prize_pools: [
  {
    pool_id: "general",
    label: "General Pool",
    total_prize: 10000,
    currency: "USDC",
    metric: "volume",
    tiers: [
      { position: 1, amount: 3000 }, // 第1名: 3000 USDC
      { position: 2, amount: 2000 }, // 第2名: 2000 USDC
      { position: 3, amount: 1000 }, // 第3名: 1000 USDC
      { position_range: [4, 10], amount: 500 }, // 第4-10名: 各500 USDC
      { position_range: [11, 50], amount: 100 }, // 第11-50名: 各100 USDC
    ],
  },
];
```

## 计算逻辑

### 排名估算

系统会根据用户的交易表现估算排名：

- 如果提供了`current_rank`，直接使用
- 否则基于交易量/盈亏进行简单估算：
  - ≥ 100,000: 排名第1
  - ≥ 50,000: 前5%
  - ≥ 10,000: 前20%
  - ≥ 1,000: 前50%
  - < 1,000: 后80%

### 奖励计算

1. 遍历所有奖池
2. 根据奖池的metric(volume/pnl)获取用户相应数据
3. 估算用户在该指标下的排名
4. 查找匹配的层级并累加奖励

### 票据计算

- **阶梯模式**: 找到用户交易量对应的最高阶梯
- **线性模式**: 按比例计算 `Math.floor(volume / every) * tickets`

## 注意事项

1. 排名估算是基于简化逻辑，实际应用中建议使用真实的排行榜数据
2. 当用户交易量或盈亏为0或负数时，某些计算会返回空结果
3. 建议在生产环境中集成真实的API数据源
