# @orderly.network/trading-shared

Shared trading UI, order-book primitives, position panels, trading preferences, and shared panel contracts used by Perps and Prediction.

Asset tables, account filters, asset summaries, Faucet, and first-deposit helpers belong to `@orderly.network/ui-assets`. Neither foundation package depends on the other, portfolio, or prediction.

Existing exports from `@orderly.network/trading` remain available. Direct shared-package imports should use the package matching their responsibility:

```ts
import {
  PerpsPositionsPanel,
  useTradingLocalStorage,
} from "@orderly.network/trading-shared";
import {
  AssetViewWidget,
  useFirstTimeDeposit,
} from "@orderly.network/ui-assets";
```

Importing the root registers the existing typed OrderBook interceptor contracts without changing their identifiers.
