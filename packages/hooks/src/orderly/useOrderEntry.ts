import { useMutation } from "../useMutation";
import { useCallback, useMemo, useReducer, useState } from "react";

import { OrderFactory, type OrderCreator } from "@orderly/futures";
import { API, OrderEntity, OrderSide, OrderType } from "@orderly/types";
import { useSymbolsInfo } from "./useSymbolsInfo";
import { Decimal } from "@orderly/utils";
import { useTokenInfo } from "./useTokenInfo";
import { useFormik } from "formik";

export interface OrderEntryReturn {
  onSubmit: (values?: OrderEntity) => Promise<any>;
  // validator: (values: OrderEntity) => Promise<any>;
  setValue: (field: keyof OrderEntity, value: any) => void;
  maxQty: number;
  freeCollateral: number;
  values: OrderEntity;
  errors: Partial<Record<keyof OrderEntity, string>>;

  symbolConfig: API.SymbolExt;
}

interface OrderState {
  // symbol: string;
  values: OrderEntity;
  errors: Partial<Record<keyof OrderEntity, string>>;
  loading?: boolean;
  dirty: boolean;
  submitCount: number;
}

enum ActionKind {
  UpdateField,
  Error,
  Loading,
}

interface OrderEntryAction {
  type: ActionKind;
  payload: any;
}

function orderReducer(state: OrderState, action: OrderEntryAction): OrderState {
  switch (action.type) {
    case ActionKind.UpdateField:
      // 校验数据是否满足要求
      return {
        ...state,
        dirty: true,
        values: action.payload,
      };
    case ActionKind.Loading:
      return {
        ...state,
        loading: action.payload,
      };

    case ActionKind.Error:
      return {
        ...state,
        errors: action.payload,
      };

    default:
      return state;
  }
}

const initialState: OrderState = {
  values: {
    order_type: OrderType.LIMIT,
    side: OrderSide.BUY,
  },
  errors: {},
  loading: false,
  dirty: false,
  submitCount: 0,
};

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
  const [freeCollateral, setFreeCollateral] = useState(0);
  const [marketPrice, setMarketPrice] = useState(100);
  const symbolInfo = useSymbolsInfo();
  const tokenInfo = useTokenInfo();

  const [state, dispatch] = useReducer(
    orderReducer,
    initialState,
    (initialState) => ({
      ...initialState,
      values: {
        ...initialState.values,
        ...initialValue,
      },
    })
  );

  //maxQty
  // const maxQty = useObservable(() => interval(1000), 0);
  const maxQty = 100;

  const orderCreator = useMemo<OrderCreator | null>(() => {
    if (!state.values.order_type) return null;
    return OrderFactory.create(state.values.order_type);
  }, [state.values]);

  // 格式化数据和计算数据
  const calculateValues = useCallback(
    (values: OrderEntity, input: string, value: any): OrderEntity => {
      const newValues = { ...values, [input]: value };
      // const symbolConfig = symbolInfo[symbol]();

      // if (newValues.order_type === OrderType.MARKET) {
      switch (input) {
        case "order_type":
        // 如果是从市价单转换为限价单，需要把当前市价赋值给限价单
        case "order_quantity": {
          const quantity = new Decimal(value);
          return {
            ...newValues,
            // order_quantity: quantity.toFixed(),
            total: quantity.mul(marketPrice).toNumber(),
          };
        }

        case "total":
          return {
            ...newValues,
            order_quantity: new Decimal(value).div(marketPrice).toNumber(),
          };

        // case "order_type":
        default:
          return newValues;
      }
      // }

      // return newValues;
    },
    [symbolInfo, symbol]
  );

  const setValue = (field: keyof OrderEntity, value: any) => {
    if (!orderCreator) {
      console.warn("orderCreator is null");
      return;
    }
    const newValue = calculateValues(state.values, field, value);

    console.log("-------");
    const errors = orderCreator.validate(newValue, {
      token: tokenInfo[symbol](),
      symbol: symbolInfo[symbol](),
      maxQty,
    });
    if (errors) {
      dispatch({
        type: ActionKind.Error,
        payload: { errors },
      });
      return;
    }
    dispatch({
      type: ActionKind.Error,
      payload: { errors: undefined },
    });
    dispatch({
      type: ActionKind.UpdateField,
      payload: newValue,
    });
  };

  /**
   * 提交订单，校验数据
   * @param values
   * @returns
   */
  const onSubmit = (values?: OrderEntity) => {
    return Promise.resolve()
      .then(() => {
        if (!orderCreator) {
          throw new Error("orderCreator is null");
        }

        if (!symbol) {
          throw new Error("symbol is null");
        }

        const errors = orderCreator.validate(state.values, {
          token: tokenInfo[symbol](),
          symbol: symbolInfo[symbol](),
          maxQty,
        });

        if (errors) {
          dispatch({
            type: ActionKind.Error,
            payload: { errors },
          });
          return Promise.reject(errors);
        }

        return mutation({
          ...orderCreator.create(state.values),
          symbol,
        });
      })
      .then((res) => {
        console.log(res);

        return res;
      });
  };

  const formik = useFormik<OrderEntity>({
    initialValues: {
      order_type: OrderType.LIMIT,
      side: OrderSide.BUY,
      order_quantity: 0,
      total: 0,
    },
    validate: (values) => {},
    onSubmit: (values) => {
      console.log(values);
    },
  });

  console.log(formik);

  return {
    maxQty: 100,
    // ...state,
    values: formik.values,
    errors: formik.errors,
    freeCollateral,
    setValue,
    onSubmit,
    symbolConfig: symbolInfo[symbol](),
    // validator: orderCreator.validate,
  };
};
