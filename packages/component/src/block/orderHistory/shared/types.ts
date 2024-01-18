import { API, OrderSide, OrderStatus } from "@orderly.network/types";

export interface OrderHistoryListViewProps {
  isLoading: boolean;
  dataSource: any[];
  side: OrderSide | "";
  status: OrderStatus | "";
  onSideChange?: (side: OrderSide) => void;
  onStatusChange?: (status: OrderStatus) => void;
  onSymbolChange?: (symbol: API.Symbol) => void;
  onCancelOrder: (orderId: number, symbol: string) => Promise<any>;
  loadMore: () => void;
  className?: string;
}
