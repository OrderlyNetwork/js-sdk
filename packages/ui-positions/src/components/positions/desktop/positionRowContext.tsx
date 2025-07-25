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
  const symbolInfo = symbolsInfo?.[symbol];
  const quoteDp = symbolInfo("quote_dp");
  const baseDp = symbolInfo("base_dp");
  const baseTick = symbolInfo("base_tick");

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
        symbolInfo(),
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
        symbolInfo(),
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
    if (Number(quantity) > symbolInfo("base_max")) {
      toast.error(
        <div>
          {t("positions.limitClose.errors.exceed.title")}
          <br />
          <div className="oui-break-normal">
            {t("positions.limitClose.errors.exceed.description", {
              quantity: quantity,
              symbol: transSymbolformString(symbol, "base"),
              maxQuantity: symbolInfo("base_max"),
            })}
          </div>
        </div>,
      );
      return;
    }

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
        tpslOrder: (position as API.PositionTPSLExt).algo_order,
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

function transSymbolformString(symbol: string, formatString = "base") {
  const arr = symbol.split("_");
  const type = arr[0];
  const base = arr[1];
  const quote = arr[2];

  return (formatString ?? "base-quote")
    .replace("type", type)
    .replace("base", base)
    .replace("quote", quote);
}
