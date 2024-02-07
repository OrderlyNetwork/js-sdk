import { API, OrderEntity } from "@orderly.network/types";

export interface OrdersViewProps {
  dataSource: any[];
  onCancelAll?: () => void;
  isLoading: boolean;
  cancelOrder: (orderId: number | OrderEntity, symbol: string) => Promise<any>;
  editOrder: (orderId: string, order: OrderEntity) => Promise<any>;
  showAllSymbol?: boolean;
  onShowAllSymbolChange?: (value: boolean) => void;
  symbol: string;
  onSymbolChange?: (symbol: API.Symbol) => void;
  loadMore: () => void;
}
