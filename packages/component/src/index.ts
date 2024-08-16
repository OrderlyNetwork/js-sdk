export { default as version } from "./version";

export * from "./provider";

// ==================== base component ====================
export { default as Button } from "./button";

export * from "./tooltip";
export * from "./text";
export * from "./listView";
export * from "./table";
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./dropdown/dropdown";
export * from "./select";
export * from "./statistic";
export * from "./illustration";

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
export type { ModalHocProps } from "./modal";
export { create } from "./modal/modalHelper";
export { Divider } from "./divider";
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "./sheet";

// ==================== page component ====================
export * from "./page";
export type { TradingPageProps } from "./page";

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

//===================== Dialog component ====================

export {
  ChainDialog,
  showAccountConnectorModal,
  // DepositAndWithdrawWithDialog,
  DepositAndWithdrawWithSheet,
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
  FooterStatusBarProps,
  ShareConfigProps,
  DesktopDropMenuItem,
} from "./block";

export { cn, parseNumber } from "./utils";

export { useCSSVariable } from "./hooks/useCSSVariable";

export type { OrderlyConfig, OrderlyConfigCtx } from "./types/orderly.config";

export { installExtension, ExtensionPosition } from "./plugin";

export * from "./datePicker";

export * from "./switch";
