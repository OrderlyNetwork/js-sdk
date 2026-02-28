# components/base/orderBook

Order book base: shared UI that delegates to desktop or mobile implementation, script hook, widget, buy-sell ratio bar, and types.

## Files

| File | Language | Description |
|------|----------|-------------|
| [index.ts](index.md) | TypeScript | Exports `OrderBook`, `OrderBookWidget`, `useOrderBookScript`, `BuySellRatioBar`, type `BuySellRatio` |
| [orderBook.ui.tsx](orderBook.ui.md) | TSX | `OrderBook`: uses `isMobile` to render desktop or mobile order book |
| [orderBook.script.tsx](orderBook.script.md) | TSX | `useOrderBookScript`: order book state (asks, bids, mark price, depth, etc.) |
| [orderBook.widget.tsx](orderBook.widget.md) | TSX | `OrderBookWidget` |
| [types.ts](types.md) | TypeScript | `QtyMode`, `TotalMode`, `OrderBookCellType` |
| [orderContext.tsx](orderContext.md) | TSX | Context for order book |
| [buySellRatioBar.tsx](buySellRatioBar.md) | TSX | `BuySellRatioBar` |
| [midPriceView.tsx](midPriceView.md) | TSX | `MiddlePriceView` |
