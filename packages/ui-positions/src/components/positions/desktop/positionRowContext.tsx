import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  KeyedMutator,
  usePositionClose,
  useSymbolsInfo,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { API, OrderEntity, OrderSide, OrderType } from "@orderly.network/types";
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
  partialTPSLOrder?: API.AlgoOrder;
  quoteDp?: number;
  baseDp?: number;
  baseTick?: number;
  errors: any | undefined;
}

export const PositionsRowContext = createContext(
  {} as PositionsRowContextState,
);

export const usePositionsRowContext = () => {
  return useContext(PositionsRowContext);
};

type PositionsRowProviderProps = PropsWithChildren<{
  position: API.PositionExt | API.PositionTPSLExt;
  mutatePositions?: KeyedMutator<API.PositionExt[]>;
}>;

export const PositionsRowProvider: FC<PositionsRowProviderProps> = (props) => {
  const { position } = props;
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState<string>(
    Math.abs(position.position_qty).toString(),
  );
  const [price, setPrice] = useState<string>("");
  const [type, setType] = useState<OrderType>(OrderType.MARKET);

  useEffect(() => {
    setQuantity(Math.abs(position.position_qty).toString());
  }, [position.position_qty]);

  const symbol = position.symbol;
  const symbolsInfo = useSymbolsInfo();
  const info = symbolsInfo?.[symbol];
  const quoteDp = info("quote_dp");
  const baseDp = info("base_dp");
  const baseTick = info("base_tick");

  const {
    side,
    closeOrderData,
    submit,
    isMutating: submitting,
    errors,
    calculate,
  } = usePositionClose({
    position,
    order: {
      type,
      quantity,
      price,
    },
  });

  const updateQuantity = useCallback(
    (value: string) => {
      const newValues = calculate(
        {},
        "order_quantity",
        value,
        position.mark_price,
        info(),
      ) as OrderEntity;
      setQuantity(newValues["order_quantity"] as string);
    },
    [calculate, symbolsInfo, position.mark_price],
  );

  const updatePriceChange = useCallback(
    (value: string) => {
      const newValues = calculate(
        {},
        "order_price",
        value,
        position.mark_price,
        info(),
      ) as OrderEntity;
      setPrice(newValues["order_price"] as string);
    },
    [calculate, symbolsInfo, position.mark_price],
  );

  const updateOrderType = useCallback((type: OrderType, price?: string) => {
    setType(type);
    if (type === OrderType.LIMIT) {
      if (!price) {
        throw new Error(t("orderEntry.orderPrice.error.required"));
      }
      setPrice(price);
    } else {
      setPrice("");
    }
  }, []);

  const onSubmit = useCallback(async () => {
    return submit()
      .then((res) => {
        if (res.success) {
          props.mutatePositions?.();
          return res;
        }

        if (res.message) {
          toast.error(res.message);
        }

        throw true;
      })
      .catch((err) => {
        if (err.message) {
          toast.error(err.message);
        }
        return false;
      });
  }, [submit]);

  return (
    <PositionsRowContext.Provider
      value={{
        quantity,
        price,
        type,
        side,
        position,
        updatePriceChange,
        updateQuantity,
        updateOrderType,
        tpslOrder: (position as API.PositionTPSLExt).full_tp_sl?.algo_order,
        partialTPSLOrder: (position as API.PositionTPSLExt).partial_tp_sl
          ?.algo_order,
        onSubmit,
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
