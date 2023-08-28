import { useMutation } from "../useMutation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { OrderFactory, type OrderCreator, orderUtils } from "@orderly/futures";
import { API, OrderEntity, OrderSide, OrderType } from "@orderly/types";
import { useSymbolsInfo } from "./useSymbolsInfo";
import { Decimal, getPrecisionByNumber } from "@orderly/utils";
import { useTokenInfo } from "./useTokenInfo";
import { type FormikErrors, useFormik } from "formik";
import { useObservable } from "rxjs-hooks";
import { useWebSocketClient } from "../useWebSocketClient";
import { switchMap, map, takeWhile } from "rxjs/operators";
import { compose, head, type } from "ramda";
import {
  OrderEntityKey,
  baseInputHandle,
  getCalculateHandler,
  orderEntityFormatHandle,
} from "../utils/orderEntryHelper";
import { useCollateral } from "./useCollateral";
import { useMaxQty } from "./useMaxQty";

export interface OrderEntryReturn {
  onSubmit: (values?: OrderEntity) => Promise<any>;
  validateForm: (values?: any) => Promise<FormikErrors<OrderEntity>>;

  setValue: (field: OrderEntityKey, value: any) => void;
  maxQty: number;
  freeCollateral: number;
  values: OrderEntity;
  markPrice: number;
  errors: Partial<Record<keyof OrderEntity, string>>;

  symbolConfig: API.SymbolExt;

  submitCount: number;

  //
  onFocus?: (field: keyof OrderEntity) => void;
  onBlur?: (field: keyof OrderEntity) => void;
}

export type UseOrderEntryOptions = {
  commify?: boolean;
  validate?: (
    data: OrderEntity
  ) => { [P in keyof OrderEntity]?: string } | null | undefined;
};

/**
 * 创建订单
 * @param symbol
 * @returns
 */
export const useOrderEntry = (
  symbol: string,
  initialValue: Partial<OrderEntity> = {},
  options?: UseOrderEntryOptions
): OrderEntryReturn => {
  const { mutation } = useMutation<OrderEntity, any>("/order");
  // const [freeCollateral, setFreeCollateral] = useState(0);
  const { freeCollateral } = useCollateral();

  const symbolInfo = useSymbolsInfo();
  const tokenInfo = useTokenInfo();

  const baseDP = useMemo(
    () => getPrecisionByNumber(symbolInfo[symbol]("base_tick", 0)),
    [symbolInfo]
  );
  const quoteDP = useMemo(() => {
    return tokenInfo.USDC("decimals", 0);
  }, [tokenInfo]);

  // 订阅maskPrice
  const ws = useWebSocketClient();

  const markPrice = useObservable(
    (_, input$) =>
      input$.pipe(
        switchMap(([symbol]) => {
          return ws.observe(`${symbol}@markprice`).pipe(
            map((data: any) => data.price)
            // takeWhile(() => type === OrderType.MARKET)
          );
        })
      ),
    0,
    [symbol]
  );

  // console.log(markPrice);

  const formik = useFormik<OrderEntity>({
    initialValues: {
      order_type: OrderType.MARKET,
      side: OrderSide.BUY,
      order_quantity: "",
      total: "",
      order_price: "",
      visible_quantity: 1,
      ...initialValue,
    },
    validate: (values) => {
      const creator = OrderFactory.create(values.order_type);

      return creator?.validate(values, {
        symbol: symbolInfo[symbol](),
        token: tokenInfo[symbol](),
        maxQty,
        markPrice: markPrice,
      }) as any;
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });

  const maxQty = useMaxQty(symbol, formik.values.side);

  const setValue = (field: OrderEntityKey, value: any) => {
    const fieldHandler = getCalculateHandler(field);
    const newValues = compose(
      head,
      orderEntityFormatHandle(baseDP, quoteDP),
      fieldHandler,
      baseInputHandle
    )([formik.values, field, value, markPrice, { baseDP, quoteDP }]);

    formik.setValues(newValues, true);
  };

  /**
   * 提交订单，校验数据
   * @param values
   * @returns
   */
  const onSubmit = (values?: OrderEntity) => {
    values = values || formik.values;

    if (
      typeof values.order_type === "undefined" ||
      (values.order_type !== OrderType.MARKET &&
        values.order_type !== OrderType.LIMIT)
    ) {
      throw new Error("order_type is error");
    }

    return Promise.resolve()
      .then(() => {
        const orderCreator = OrderFactory.create(values.order_type);

        console.log(orderCreator);

        if (!orderCreator) {
          throw new Error("orderCreator is null");
        }

        if (!symbol) {
          throw new Error("symbol is null");
        }

        const data = orderCreator.create(values);

        console.log(data);

        return mutation({
          ...data,
          symbol,
        });
      })
      .then((res) => {
        console.log(res);

        return res;
      });
  };

  // symbol 变化的时候重置表单
  useEffect(() => {
    if (symbol !== formik.values.symbol) {
      formik.resetForm();
    }
  }, [symbol, formik.values.symbol]);

  // console.log(formik);
  // market order时计算total
  // useEffect(() => {}, [formik.values.order_type, formik.values.order_quantity]);

  // console.log(formik);

  return {
    maxQty,
    // formState,
    values: formik.values,
    errors: formik.errors,
    freeCollateral,
    markPrice,
    setValue,
    onSubmit,
    validateForm: formik.validateForm,
    submitCount: formik.submitCount,
    symbolConfig: symbolInfo[symbol](),
  };
};
