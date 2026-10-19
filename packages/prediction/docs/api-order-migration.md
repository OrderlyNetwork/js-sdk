# 预测市场订单迁移到 API.Order

预测市场的账户数据、订单查询和组件统一接收或返回 `API.Order`，不再重新构建订单对象。`PredictionOpenOrder`、`PredictionTrade` 和 `toPredictionOrder()` 已删除，不保留旧类型别名。这是公开数据结构变更，外部集成需要同步迁移。

`openOrders`、`history` 和 `useBinaryOrderRows().rows` 的数组入口保持原名。产品筛选只过滤记录，保留原对象引用、原字段及接口新增字段；显示所需的 UP/DOWN、方向、价格和轮次在消费时推导。

## 字段迁移

| 旧字段                             | 原始字段或展示函数                                                                        |
| ---------------------------------- | ----------------------------------------------------------------------------------------- |
| `id`                               | `order_id`                                                                                |
| `timestamp`                        | `created_time`，仍为毫秒                                                                  |
| `filledQuantity`                   | `total_executed_quantity`                                                                 |
| `averagePrice`                     | `average_executed_price`，仍为 UP 坐标                                                    |
| `totalFee` / `feeAsset`            | `total_fee` / `fee_asset`                                                                 |
| `realizedPnl`                      | `realized_pnl`                                                                            |
| `reduceOnly`                       | `reduce_only`                                                                             |
| `clientOrderId` / `orderTag`       | `client_order_id` / `order_tag`                                                           |
| `orderType`                        | `type`，保留 `LIMIT`、`IOC`、`SETTLEMENT` 等原始类型                                      |
| `type`（原来的 market/limit 分类） | `binaryOrderDisplayType(order)`                                                           |
| `side`（原来的小写接口方向）       | `side`，现在是接口原始的 `BUY` / `SELL`；界面买卖动作使用 `binaryOrderDisplaySide(order)` |
| `status`（原来的小写状态）         | `status`，保留接口状态；界面分类使用 `binaryOrderDisplayStatus(order)`                    |
| `outcome`                          | `binaryOrderOutcome(order)`                                                               |
| `round`                            | `binaryOrderRound(order)`，仍为秒                                                         |

以上展示函数均从 `@orderly.network/prediction` 根入口导出。`toPredictionOrderStatus` / `toApiPredictionOrderStatus` 继续用于筛选状态的双向转换。

```ts
import {
  binaryOrderDisplayPrice,
  binaryOrderDisplaySide,
  binaryOrderOutcome,
} from "@orderly.network/prediction";
import type { API } from "@orderly.network/types";

declare const order: API.Order;

const outcome = binaryOrderOutcome(order);
const displaySide = binaryOrderDisplaySide(order);
const displayPrice =
  order.price != null && Number.isFinite(order.price)
    ? binaryOrderDisplayPrice(order, order.price)
    : undefined;
const pnl = order.realized_pnl;
```

## 保留的业务行为

- 原始价格始终使用 UP 坐标；只有 DOWN 展示和编辑输入边界取互补价，不覆盖接口记录。
- 编辑订单沿用原始方向、类型、reduce-only 标志和客户端元数据。
- Filled 包含有成交量的终态订单，包括部分成交后取消的 IOC；不包含尚在挂单中的部分成交订单或零成交终态订单。
- 订单 Realized PnL 直接使用 `realized_pnl`，不额外扣手续费、不按 outcome 改符号。OR-7560 示例显示 `-8.00`，CSV 保留原始 `-8`；持仓历史的扣费净盈亏口径不变。
- 缺失或非有限的盈亏、均价和费用在展示边界处理，不修改原始订单。零盈亏保持中性显示，小额盈亏及 RTL 方向沿用现有格式。
