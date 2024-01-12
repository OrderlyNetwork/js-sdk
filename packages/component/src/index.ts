export { default as version } from "./version";

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
export { Spinner } from "./spinner";
export {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Collapse,
} from "./collapsible";

export { toast } from "./toast";
export { modal, useModal } from "./modal";

// ==================== page component ====================
export * from "./page";

export { Page, Layout } from "./layout";

// ==================== block component ====================
export {
  OrderEntry,
  OrderBook,
  Deposit,
  Withdraw,
  Markets,
  MarketsFull,
  WalletConnect,
  TradeHistory,
  OrdersView,
  PositionsView,
  PositionsViewFull,
  ClosePositionPane,
  AccountStatusBar,
  AssetAndMarginSheet,
  ChainListView,
  ChainSelect,
  SystemStatusBar,
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

export { cn, parseNumber } from "./utils";

export { useCSSVariable } from "./hooks/useCSSVariable";

export type { OrderlyConfig, OrderlyConfigCtx } from "./types/orderly.config";
