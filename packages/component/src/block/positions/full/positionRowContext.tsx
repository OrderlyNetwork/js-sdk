import { modal } from "@orderly.network/ui";
import { API, OrderEntity, OrderType } from "@orderly.network/types";
import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { LimitConfirm } from "../sections/limitConfirm";
import { OrderSide } from "@orderly.network/types";
import { useSymbolContext } from "@/provider/symbolProvider";

import { useOrderEntry_deprecated } from "@orderly.network/hooks";

export interface PositionsRowContextState {
  quantity: string;
  price: string;
  type: OrderType;
  side: OrderSide;
  position: API.PositionExt | API.PositionTPSLExt;
  updateQuantity: (value: string) => void;
  updatePriceChange: (value: string) => void;

  updateOrderType: (value: OrderType, price?: string) => void;

  closeOrderData: any;

  onSubmit: () => Promise<any>;
  submitting: boolean;
  tpslOrder?: API.AlgoOrder;
}

export const PositionsRowContext = createContext(
  {} as PositionsRowContextState
);

export const usePositionsRowContext = () => {
  return useContext(PositionsRowContext);
};

export const PositionsRowProvider: FC<
  PropsWithChildren<{ position: API.PositionExt | API.PositionTPSLExt }>
> = (props) => {
  const [quantity, setQuantity] = useState<string>(
    Math.abs(props.position.position_qty).toString()
  );

  useEffect(() => {
    setQuantity(Math.abs(props.position.position_qty).toString());
  }, [props.position.position_qty]);

  const [price, setPrice] = useState<string>("");
  const [side, setSide] = useState<OrderSide>(
    props.position.position_qty > 0 ? OrderSide.SELL : OrderSide.BUY
  );

  const [type, setType] = useState<OrderType>(OrderType.MARKET);

  const { helper, onSubmit, submitting } = useOrderEntry_deprecated(
    props.position?.symbol!,
    side,
    true
  );

  const updateOrderType = (type: OrderType, price?: string) => {
    setType(type);
    if (type === OrderType.LIMIT) {
      if (!price) {
        throw new Error("price is required");
      }
      setPrice(price);
    } else {
      setPrice("");
    }
  };

  const closeOrderData = useMemo(() => {
    const { position } = props;

    if (!position) return null;

    const data: any = {
      //   order_price: undefined,
      order_quantity: quantity,
      symbol: props.position.symbol,
      order_type: type,
      side,
      reduce_only: true,
    };

    if (type === OrderType.LIMIT) {
      data.order_price = price;
    }

    return data;
  }, [props.position, price, type, quantity]);

  const onUpdateQuantity = (value: string) => {
    const newValues = helper.calculate(
      {},
      "order_quantity",
      value
    ) as OrderEntity;
    setQuantity(newValues["order_quantity"] as string);
  };

  const onUpdatePrice = (value: string) => {
    const newValues = helper.calculate({}, "order_price", value) as OrderEntity;
    setPrice(newValues["order_price"] as string);
  };

  const postOrder = () => {
    return onSubmit(closeOrderData);
  };

  return (
    <PositionsRowContext.Provider
      value={{
        quantity,
        price,
        type,
        side,
        position: props.position,
        updatePriceChange: onUpdatePrice,
        updateQuantity: onUpdateQuantity,
        updateOrderType,
        tpslOrder: (props.position as unknown as API.PositionTPSLExt)
          .algo_order,
        onSubmit: postOrder,
        submitting,
        closeOrderData,
      }}
    >
      {props.children}
    </PositionsRowContext.Provider>
  );
};
