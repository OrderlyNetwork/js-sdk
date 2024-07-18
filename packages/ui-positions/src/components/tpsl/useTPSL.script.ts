import { useSymbolsInfo, useTPSLOrder } from "@orderly.network/hooks";
import { AlgoOrderRootType, API } from "@orderly.network/types";

export type TPSLBuilderOptions = {
  //   symbol: string;
  /**
   * The maximum quantity that can be set for the TP/SL order
   */
  //   maxQty: number;
  // onSuccess?: () => void;
  // onCancel?: () => void;
  position: API.Position;
  order?: API.AlgoOrder;
  // canModifyQty?: boolean;
  // isEditing?: boolean;
  // onTypeChange?: (type: AlgoOrderRootType) => void;
  // quoteDp?: number;
};

export const useTPSLBuilder = (options: TPSLBuilderOptions) => {
  const { position, order } = options;
  const isEditing = !!order;
  const symbol = isEditing ? order.symbol : position.symbol;
  const symbolInfo = useSymbolsInfo();

  const [tpslOrder, { submit, setValue, validate, errors }] = useTPSLOrder(
    {
      symbol,
      position_qty: position.position_qty,
      average_open_price: position.average_open_price,
    },
    {
      defaultOrder: order,
    }
  );

  //   console.log("tpslOrder", tpslOrder, errors);

  return {
    // quoteDp: symbolInfo[symbol]("quote_dp"),
    isEditing,
    symbolInfo: symbolInfo[symbol],
    maxQty: position.position_qty,
  } as const;
};

export type TPSLBuilderState = ReturnType<typeof useTPSLBuilder>;
