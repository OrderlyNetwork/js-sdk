import { useBadgeBySymbol } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { Text } from "@orderly.network/ui";

export interface OrderSymbolCellProps {
  symbol: string;
  onSymbolChange?: (symbol: API.Symbol) => void;
}

export const OrderSymbolCell = (props: OrderSymbolCellProps) => {
  const { symbol, onSymbolChange } = props;
  const { brokerId, brokerName } = useBadgeBySymbol(symbol);

  return (
    <Text.symbolBadge
      className="oui-cursor-pointer"
      badge={brokerName ?? brokerId ?? undefined}
      onClick={(e) => {
        onSymbolChange?.({ symbol } as API.Symbol);
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      {symbol}
    </Text.symbolBadge>
  );
};
