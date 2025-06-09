import { useCallback, useEffect, useMemo, useState } from "react";
import {
  API,
  OrderlyOrder,
  OrderSide,
  OrderType,
} from "@orderly.network/types";
import { useMarkPricesStream } from "../../orderly/useMarkPricesStream";
import { useSymbolsInfo } from "../../orderly/useSymbolsInfo";
import { useSubAccountMutation } from "../../subAccount";
import { calculate } from "../../utils/orderEntryHelper";
import { OrderValidationResult } from "../useOrderEntry";
import { getOrderCreator } from "../useOrderEntry/helper";

type PositionCloseOptions = {
  position: API.PositionExt;
  order: {
    type: OrderType;
    quantity: string;
    price: string;
  };
};

export const usePositionClose = (options: PositionCloseOptions) => {
  const { position, order: initialOrder } = options;
  const { type, quantity, price } = initialOrder;
  const symbol = position.symbol;

  const [errors, setErrors] = useState<OrderValidationResult | null>(null);

  const symbolsInfo = useSymbolsInfo();
  const { data: markPrices } = useMarkPricesStream();

  const [doCreateOrder, { isMutating }] = useSubAccountMutation(
    "/v1/order",
    "POST",
    {
      accountId: position.account_id,
    },
  );

  const side = position.position_qty > 0 ? OrderSide.SELL : OrderSide.BUY;

  const closeOrderData = useMemo(() => {
    const data: Partial<OrderlyOrder> = {
      order_quantity: quantity,
      symbol,
      order_type: type,
      side,
      reduce_only: true,
    };

    if (type === OrderType.LIMIT) {
      data.order_price = price;
    }

    return data;
  }, [symbol, price, type, quantity]);

  const maxQty = useMemo(() => {
    if (!position) {
      return 0;
    }

    /**
     * Reduce-only mode handling:
     * For long positions (positionQty > 0):
     * - Buy orders return 0 (cannot increase long position)
     * - Sell orders return absolute position quantity (can close long position)
     * For short positions (positionQty < 0):
     * - Buy orders return absolute position quantity (can close short position)
     * - Sell orders return 0 (cannot increase short position)
     */
    const positionQty = position.position_qty;
    if (positionQty > 0) {
      if (side === OrderSide.BUY) {
        return 0;
      } else {
        return Math.abs(positionQty);
      }
    }

    if (positionQty < 0) {
      if (side === OrderSide.BUY) {
        return Math.abs(positionQty);
      } else {
        return 0;
      }
    }

    return 0;
  }, [position, side]);

  /**
   * validate order
   */
  const validate = useCallback(
    async (data: Partial<OrderlyOrder>) => {
      const creator = getOrderCreator(data);
      const errors = await creator.validate(data, {
        symbol: symbolsInfo[symbol](),
        maxQty,
        markPrice: markPrices[symbol],
      });
      return errors;
    },
    [markPrices, maxQty, symbol, symbolsInfo],
  );

  useEffect(() => {
    validate(closeOrderData).then((errors) => {
      setErrors(errors);
    });
  }, [validate, closeOrderData]);

  const submit = useCallback(async () => {
    const errors = await validate(closeOrderData);

    if (Object.keys(errors).length > 0) {
      throw errors;
    }

    return doCreateOrder(closeOrderData)
      .then((res) => {
        if (res.success) {
          return res;
        }

        throw res;
      })
      .catch((err) => {
        throw err;
      });
  }, [validate, doCreateOrder, closeOrderData]);

  return {
    submit,
    isMutating,
    side,
    closeOrderData,
    errors,
    calculate,
  };
};
