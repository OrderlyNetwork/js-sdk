import { API, OrderEntity } from "@orderly.network/types";

export interface OrdersViewProps {
  dataSource: any[];

  onCancelAll?: () => Promise<any>;
  isLoading: boolean;
  isStopOrder?: boolean;
  cancelOrder: (orderId: number, symbol: string) => Promise<any>;
  editOrder: (orderId: string, order: OrderEntity) => Promise<any>;
  cancelAlgoOrder: (orderId: number, symbol: string) => Promise<any>;
  editAlgoOrder: (orderId: string, order: OrderEntity) => Promise<any>;
  cancelTPSLOrder: (orderId: number, rootAlgoOrderId: number) => Promise<any>;
  showAllSymbol?: boolean;
  onShowAllSymbolChange?: (value: boolean) => void;
  symbol: string;
  onSymbolChange?: (symbol: API.Symbol) => void;
  loadMore: () => void;
}
