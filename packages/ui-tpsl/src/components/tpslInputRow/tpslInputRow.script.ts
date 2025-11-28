import { useMemo } from "react";
import {
  OrderValidationResult,
  useLeverageBySymbol,
} from "@orderly.network/hooks";
import { order } from "@orderly.network/perp";
import { OrderSide, OrderType, PositionType } from "@orderly.network/types";

export type Props = {
  disableOrderTypeSelector?: boolean;
  type: "tp" | "sl";
  quote_dp: number;
  positionType: PositionType;
  errors: OrderValidationResult | null;
  hideOrderPrice?: boolean;
  values: {
    // enable: boolean;
    trigger_price: string | undefined;
    PnL: string | undefined;
    Offset: string | undefined;
    "Offset%": string | undefined;
    ROI?: string | undefined;
    order_price: string | undefined;
    order_type: OrderType;
  };
  onChange: (key: string, value: string | boolean | number) => void;
  rootOrderPrice: string | undefined;
  symbol: string;
  disableEnableCheckbox?: boolean;
  symbolLeverage?: number;
  side: OrderSide;
  inputWarnNode?: React.ReactNode;
};
export const useTPSLInputRowScript = (props: Props) => {
  const { values, side, type, rootOrderPrice } = props;
  // if symbolLeverage is not provided, get it from useLeverageBySymbol
  const symbolLeverage = useLeverageBySymbol(
    props.symbolLeverage ? undefined : props.symbol,
  );

  const leverage = props.symbolLeverage || symbolLeverage;

  const roi = useMemo(() => {
    if (!leverage || !rootOrderPrice || Number(rootOrderPrice) === 0) {
      return null;
    }

    let closePrice: string | undefined;
    if (values.order_type === OrderType.MARKET) {
      closePrice = values.trigger_price;
    } else if (values.order_type === OrderType.LIMIT) {
      closePrice = values.order_price;
    }
    if (!closePrice) {
      return null;
    }

    try {
      const roi = order.tpslROI({
        side,
        type,
        closePrice: Number(closePrice),
        orderPrice: Number(rootOrderPrice),
        leverage,
      });
      return roi * 100;
    } catch (error) {
      console.error("error", error);
      return null;
    }
  }, [values, leverage, rootOrderPrice, type, side]);

  return {
    ...props,
    roi,
  };
};
