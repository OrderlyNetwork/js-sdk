# pages/overview

## Overview

Portfolio overview: main dashboard, performance chart, asset chart, asset history, funding history, distribution, transfer history, vaults history, period selector, and mobile-specific widgets (portfolio value, account status, trader/affiliate/rewards cards, etc.).

## Subdirectories / key files

| Path | Description |
|------|-------------|
| [module.md](module.md) | Overview module entry (index.tsx). |
| [main.md](main.md) | Main overview page content (main.tsx). |
| [provider/overviewProvider.tsx](provider/overviewProvider.md) | Overview provider. |
| [provider/overviewContext.tsx](provider/overviewContext.md) | Overview context. |
| [shared/useAssetHistory.ts](shared/useAssetHistory.md) | useAssetsHistoryData hook (period, PnL, ROI, volume). |
| [shared/periodHeader.tsx](shared/periodHeader.md) | Period selector header. |
| [helper/date.ts](helper/date.md) | parseDateRangeForFilter. |
| [performance/](performance/index.md) | Performance chart widget/UI/script. |
| [performanceMobileDialog/](performanceMobileDialog/index.md) | Mobile performance dialog. |
| [assetChart/](assetChart/index.md) | Asset chart widget/UI/script. |
| [assets/](assets/index.md) | Overview assets section (chart header, widget, UI, script). |
| [assetHistory/](assetHistory/index.md) | Asset history table (widget, UI, mobile, script, columns). |
| [funding/](funding/index.md) | Funding history. |
| [distribution/](distribution/index.md) | Distribution history. |
| [TransferHistory/](TransferHistory/index.md) | Transfer history. |
| [VaultsHistory/](VaultsHistory/index.md) | Vaults history. |
| [historyDataGroup/](historyDataGroup/index.md) | History data group (desktop/mobile). |
| [portfolioChartsMobile/](portfolioChartsMobile/index.md) | Mobile portfolio charts. |
| [mobile/](mobile/index.md) | Mobile widgets (portfolio value, account status, trader card, etc.). |
