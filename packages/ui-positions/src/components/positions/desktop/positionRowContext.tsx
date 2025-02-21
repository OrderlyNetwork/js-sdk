import { API, OrderEntity, OrderSide, OrderType } from "@orderly.network/types";
import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useOrderEntry_deprecated,
  useSymbolsInfo,
} from "@orderly.network/hooks";
import { toast } from "@orderly.network/ui";

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
  quoteDp?: number;
  baseDp?: number;
  baseTick?: number;
  errors: any | undefined;
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
  // const [side, setSide] = useState<OrderSide>(
  //   props.position.position_qty > 0 ? OrderSide.SELL : OrderSide.BUY
  // );

  const side = props.position.position_qty > 0 ? OrderSide.SELL : OrderSide.BUY;

  const [errors, setErrors] = useState<any | undefined>(undefined);

  const [type, setType] = useState<OrderType>(OrderType.MARKET);

  const config = useSymbolsInfo();
  const symbol = props.position.symbol;
  const curSymbolInfo = config?.[symbol];
  const quoteDp = curSymbolInfo("quote_dp");
  const baseDp = curSymbolInfo("base_dp");
  const baseTick = curSymbolInfo("base_tick");

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

  useEffect(() => {
    let order = closeOrderData;
    helper.validator(order).then((value: any) => {
      setErrors(value);
    });
  }, [closeOrderData]);

  const postOrder = () => {
    return onSubmit(closeOrderData).catch((error) => {
      if (typeof error === "string") {
        toast.error(error);
      } else {
        toast.error(error.message);
      }
      return Promise.resolve();
    });
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
        quoteDp,
        baseDp,
        baseTick,
        errors,
      }}
    >
      {props.children}
    </PositionsRowContext.Provider>
  );
};
