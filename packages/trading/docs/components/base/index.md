# components/base

Shared base components used by both desktop and mobile: order book container, last trades, position header, countdown, and order book types.

## Files

| File | Language | Description |
|------|----------|-------------|
| [orderBook/index.ts](orderBook/index.md) | TypeScript | Exports `OrderBook`, `OrderBookWidget`, `useOrderBookScript`, `BuySellRatioBar`, `BuySellRatio` |
| [orderBook/orderBook.ui.tsx](orderBook/orderBook.ui.md) | TSX | `OrderBook`: responsive order book (desktop/mobile) |
| [orderBook/orderBook.script.tsx](orderBook/orderBook.script.md) | TSX | `useOrderBookScript`, order book state |
| [orderBook/orderBook.widget.tsx](orderBook/orderBook.widget.md) | TSX | `OrderBookWidget` |
| [orderBook/types.ts](orderBook/types.md) | TypeScript | `QtyMode`, `TotalMode`, `OrderBookCellType` |
| [orderBook/orderContext.tsx](orderBook/orderContext.md) | TSX | Order book context |
| [orderBook/buySellRatioBar.tsx](orderBook/buySellRatioBar.md) | TSX | `BuySellRatioBar` |
| [orderBook/midPriceView.tsx](orderBook/midPriceView.md) | TSX | `MiddlePriceView` |
| [lastTrades/index.ts](lastTrades/index.md) | TypeScript | Exports `LastTrades`, `LastTradesWidget` |
| [lastTrades/lastTrades.ui.tsx](lastTrades/lastTrades.ui.md) | TSX | `LastTrades` |
| [positionHeader/index.ts](positionHeader/index.md) | TypeScript | Position header exports |
| [positionHeader/positionHeader.ui.tsx](positionHeader/positionHeader.ui.md) | TSX | `PositionHeader` |
| [positionHeader/positionHeader.widget.tsx](positionHeader/positionHeader.widget.md) | TSX | `PositionHeaderWidget` |
| [positionHeader/positionHeader.script.tsx](positionHeader/positionHeader.script.md) | TSX | Position header script |
| [countdown.tsx](countdown.md) | TSX | Countdown component |
