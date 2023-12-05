// export { Button } from "./button";
export {
  OrderlyAppProvider,
  OrderlyAppContext,
  SymbolProvider,
  SymbolContext,
  AssetsProvider,
  AssetsContext,
} from "./provider";

// ==================== base component ====================
export { default as Button } from "./button";
export {
  Dialog,
  DialogContent,
  // DialogContainer,
  DialogBody,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  AlertDialog,
  SimpleDialog,
} from "./dialog";
export * from "./input";
export * from "./tab";
export { Progress } from "./progress";

export { toast } from "./toast";
export { modal, useModal } from "./modal";

// ==================== page component ====================
export * from "./page";

export { Page } from "./layout";

// ==================== block component ====================
export {
  OrderEntry,
  OrderBook,
  Deposit,
  Withdraw,
  Markets,
  WalletConnect,
  TradeHistory,
  OrdersView,
  PositionsView,
  ClosePositionPane,
  AccountStatusBar,
  AssetAndMarginSheet,
  ChainListView,
  ChainSelect,
} from "./block";

export type {
  OrderEntryProps,
  OrderBookProps,
  DepositProps,
  WithdrawProps,
  MarketsProps,
  TradeHistoryProps,
  OrdersViewProps,
  PositionsViewProps,
  AccountStatusProps,
} from "./block";
