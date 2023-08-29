import { useMutation } from "../useMutation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { API, OrderEntity, OrderSide, OrderType } from "@orderly.network/types";
import { useSymbolsInfo } from "./useSymbolsInfo";
import { Decimal, getPrecisionByNumber } from "@orderly.network/utils";
import { useTokenInfo } from "./useTokenInfo";
import { type FormikErrors, useFormik, FormikState } from "formik";
import { useEventCallback, useObservable } from "rxjs-hooks";
import { useWebSocketClient } from "../useWebSocketClient";
import { switchMap, map, takeWhile, withLatestFrom } from "rxjs/operators";
import { compose, head, type } from "ramda";
import {
  OrderEntityKey,
  baseInputHandle,
  getCalculateHandler,
  orderEntityFormatHandle,
} from "../utils/orderEntryHelper";
import { useCollateral } from "./useCollateral";
import { useMaxQty } from "./useMaxQty";
import { Observable } from "rxjs";
import { OrderFactory, OrderFormEntity } from "../utils/createOrder";

export interface OrderEntryReturn {
  onSubmit: (values?: OrderEntity) => Promise<any>;
  validateForm: (values?: any) => Promise<FormikErrors<OrderEntity>>;
  resetForm: (nextState?: Partial<FormikState<OrderEntity>>) => void;

  setValue: (field: OrderEntityKey, value: any) => void;
  maxQty: number;
  freeCollateral: number;
  values: OrderEntity;
  markPrice: number;
  errors: Partial<Record<keyof OrderEntity, string>>;

  symbolConfig: API.SymbolExt;

  submitCount: number;
  isSubmitting: boolean;

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
  // const [orderType, setOrderType] = useState<OrderType>(OrderType.MARKET);
  // const [orderSide, setOrderSide] = useState<OrderSide>(OrderSide.BUY);
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

  const [valuesUpdate, [orderExtraValues]] = useEventCallback(
    (event$: Observable<any>, state$) => {
      return event$.pipe(
        withLatestFrom(state$),
        map(([event, state]) => {
          const { field, value } = event;

          console.log("orderExtraValues", field, value);

          return [{ ...state[0], [field]: value }];
        })
      );
    },
    [
      {
        order_type: OrderType.MARKET,
        side: OrderSide.BUY,
        reduce_only: false,
      },
    ]
  );

  // console.log("orderExtraValues", orderExtraValues);

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

  const formik = useFormik<OrderFormEntity>({
    initialValues: {
      // order_type: OrderType.MARKET,
      // side: OrderSide.BUY,
      order_quantity: "",
      total: "",
      order_price: "",
      visible_quantity: 1,
      ...initialValue,
    },
    validate: (values) => {
      const creator = OrderFactory.create(orderExtraValues.order_type);

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

  const maxQty = useMaxQty(
    symbol,
    orderExtraValues.side,
    orderExtraValues.reduce_only
  );

  const formFieldds = useMemo(() => {
    return ["order_quantity", "order_price", "total"];
  }, []);

  const setValue = (field: OrderEntityKey, value: any) => {
    if (formFieldds.indexOf(field) < 0) {
      valuesUpdate({ field, value });
      return;
    }

    const fieldHandler = getCalculateHandler(field);
    const newValues = compose(
      head,
      orderEntityFormatHandle(baseDP, quoteDP),
      fieldHandler,
      baseInputHandle
    )([
      { ...formik.values, ...orderExtraValues },
      field,
      value,
      markPrice,
      { baseDP, quoteDP },
    ]);

    formik.setValues(newValues as OrderEntity, true);
  };

  /**
   * 提交订单，校验数据
   * @param values
   * @returns
   */
  const onSubmit = (values?: OrderEntity) => {
    values = (values || formik.values) as OrderEntity;

    if (
      typeof values.order_type === "undefined" ||
      (values.order_type !== OrderType.MARKET &&
        values.order_type !== OrderType.LIMIT)
    ) {
      throw new Error("order_type is error");
    }

    return Promise.resolve().then(() => {
      const orderCreator = OrderFactory.create(
        !!values!.order_type_ext ? values!.order_type_ext : values!.order_type
      );

      if (!orderCreator) {
        throw new Error("orderCreator is null");
      }

      if (!symbol) {
        throw new Error("symbol is null");
      }

      const data = orderCreator.create(values!);

      console.log("orderentry data:::", data);

      formik.setSubmitting(true);

      return mutation({
        ...data,
        symbol,
      }).finally(() => {
        formik.setSubmitting(false);
      });
    });
  };

  // symbol 变化的时候重置表单
  useEffect(() => {
    // if (symbol !== formik.values.symbol) {
    formik.resetForm();
    // }
  }, [symbol]);

  return {
    maxQty,
    // formState,
    values: { ...formik.values, ...orderExtraValues },
    errors: formik.errors,
    freeCollateral,
    markPrice,
    setValue,
    onSubmit,
    isSubmitting: formik.isSubmitting,
    resetForm: formik.resetForm,
    validateForm: formik.validateForm,
    submitCount: formik.submitCount,
    symbolConfig: symbolInfo[symbol](),
  };
};
