# @orderly.network/ui-assets

Shared asset tables, conversion history, account aggregation and filtering, asset summaries, Faucet, and first-deposit helpers.

```tsx
import {
  AssetsWidget,
  AssetsTabWidget,
  AssetViewWidget,
} from "@orderly.network/ui-assets";
import "@orderly.network/ui-assets/dist/styles.css";
```

Use these components inside the same Orderly account and app providers required by the existing SDK pages. `AssetsWidget` adapts to desktop/mobile layouts; `AssetsTabWidget` fills a fixed-height data-panel tab. `AssetViewWidget` shows the trading-page account summary and deposit/withdrawal controls.

The package also exports `useAccountsData`, `useAccountFilter`, `useAssetsAccountFilter`, `useAssetsMultiFilter`, `useAssetTotalValue`, `useAssetViewScript`, `useFaucetScript`, and `useFirstTimeDeposit`, with their existing types and behavior.

Portfolio and trading keep their existing public exports and include asset utilities in their compiled styles. Existing page consumers do not need to change imports or add another stylesheet. Import the standalone asset stylesheet when using this package directly.

This package has no dependency on trading-shared, portfolio, or prediction. Storage keys, translations, CSS classes, and modal identifiers remain unchanged.
