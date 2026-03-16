# orderly

## Overview

Orderly trading and market hooks: orderbook, symbols, markets, mark/index prices, funding, positions, orders, wallet subscriptions, TPSL, calculator, statistics, maintenance.

## Subdirectories

| Directory | Description |
|-----------|-------------|
| [calculator](./calculator/index.md) | Calculator service, portfolio, positions, orders, asset calculator |
| [internal](./internal/index.md) | Internal WS observer |
| [statistics](./statistics/index.md) | Daily stats, funding fee, distribution, transfer, vaults history |
| [useMarket](./useMarket/index.md) | Market store and market list/map |
| [useMarkPrice](./useMarkPrice/index.md) | Mark price store |
| [useIndexPrice](./useIndexPrice/index.md) | Index price store |
| [useOrderStream](./useOrderStream/index.md) | Order stream and sub-account algo order stream |
| [usePositionStream](./usePositionStream/index.md) | Position stream and store |
| [useTakeProfitAndStopLoss](./useTakeProfitAndStopLoss/index.md) | TPSL hook and utils |
| [useTokensInfo](./useTokensInfo/index.md) | Tokens info store |
| [wsTopic](./wsTopic/index.md) | Wallet and balance topic hooks |

## Root-level files

| File | Language | Description |
|------|----------|-------------|
| [orderlyHooks](./orderlyHooks.md) | TypeScript | Barrel export of all orderly hooks |
| [appStore](./appStore.md) | TypeScript | App store (portfolio, funding rate by symbol) |
| [useAccountInfo](./useAccountInfo.md) | TypeScript | Account info hook |
| [useBalanceSubscription](./useBalanceSubscription.md) | TypeScript | Balance subscription |
| [useChain](./useChain.md) | TypeScript | Chain hook |
| [useChainInfo](./useChainInfo.md) | TypeScript | Chain info hook |
| [useChains](./useChains.md) | TypeScript | Chains and storage chain |
| [useCollateral](./useCollateral.md) | TypeScript | Collateral hook |
| [useComputedLTV](./useComputedLTV.md) | TypeScript | Computed LTV |
| [useConvert](./useConvert.md) | TypeScript | Convert hook |
| [useDeposit](./useDeposit.md) | TypeScript | Deposit hook |
| [useFundingDetails](./useFundingDetails.md) | TypeScript | Funding details |
| [useFundingRate](./useFundingRate.md) | TypeScript | Funding rate by symbol |
| [useFundingRateHistory](./useFundingRateHistory.md) | TypeScript | Funding rate history |
| [useFundingRates](./useFundingRates.md) | TypeScript | All funding rates |
| [useHoldingStream](./useHoldingStream.md) | TypeScript | Holding stream |
| [useIndexPrice](./useIndexPrice.md) | TypeScript | Index price by symbol |
| [useIndexPricesStream](./useIndexPricesStream.md) | TypeScript | Index prices stream |
| [useInternalTransfer](./useInternalTransfer.md) | TypeScript | Internal transfer |
| [useLeverage](./useLeverage.md) | TypeScript | Leverage hook |
| [useLeverageBySymbol](./useLeverageBySymbol.md) | TypeScript | Leverage by symbol |
| [useMaintenanceStatus](./useMaintenanceStatus.md) | TypeScript | Maintenance status |
| [useMarginRatio](./useMarginRatio.md) | TypeScript | Margin ratio |
| [useMarkPrice](./useMarkPrice.md) | TypeScript | Mark price by symbol |
| [useMarkPricesStream](./useMarkPricesStream.md) | TypeScript | Mark prices stream |
| [useMarket](./useMarket.md) | TypeScript | Single market |
| [useMarketTradeStream](./useMarketTradeStream.md) | TypeScript | Market trade stream |
| [useMarkets](./useMarkets.md) | TypeScript | Markets list and store |
| [useMarketsStream](./useMarketsStream.md) | TypeScript | Markets stream |
| [useMaxLeverage](./useMaxLeverage.md) | TypeScript | Max leverage |
| [useMaxQty](./useMaxQty.md) | TypeScript | Max quantity |
| [useMaxWithdrawal](./useMaxWithdrawal.md) | TypeScript | Max withdrawal |
| [useOdosQuote](./useOdosQuote.md) | TypeScript | Odos quote |
| [useOpenInterest](./useOpenInterest.md) | TypeScript | Open interest |
| [useOrderbookStream](./useOrderbookStream.md) | TypeScript | Orderbook stream |
| [usePortfolio](./usePortfolio.md) | TypeScript | (via appStore) |
| [usePrivateDataObserver](./usePrivateDataObserver.md) | TypeScript | Private data observer |
| [usePublicDataObserver](./usePublicDataObserver.md) | TypeScript | Public data observer |
| [useRwaSymbolsInfo](./useRwaSymbolsInfo.md) | TypeScript | RWA symbols info |
| [useSettleSubscription](./useSettleSubscription.md) | TypeScript | Settle subscription |
| [useStorageChain](./useStorageChain.md) | TSX | Storage chain |
| [useStorageLedgerAddress](./useStorageLedgerAddress.md) | TypeScript | Storage ledger address |
| [useSymbolInfo](./useSymbolInfo.md) | TypeScript | Symbol info |
| [useSymbolLeverage](./useSymbolLeverage.md) | TypeScript | Symbol leverage |
| [useSymbolPriceRange](./useSymbolPriceRange.md) | TypeScript | Symbol price range |
| [useSymbolsInfo](./useSymbolsInfo.md) | TypeScript | Symbols info |
| [useSymbolsInfoStore](./useSymbolsInfo.md) | TypeScript | (same module) |
| [useTickerStream](./useTickerStream.md) | TypeScript | Ticker stream for symbol |
| [useTokensInfo](./useTokensInfo.md) | TypeScript | (see useTokensInfo dir) |
| [useTransfer](./useTransfer.md) | TypeScript | Transfer hook |
| [useWalletSubscription](./useWalletSubscription.md) | TypeScript | Wallet subscription |
| [useWithdraw](./useWithdraw.md) | TypeScript | Withdraw hook |
| [orderbook.service](./orderbook.service.md) | TypeScript | Orderbook service |
