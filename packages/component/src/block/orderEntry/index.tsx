"use client";

import { Input } from "@/input";

import { Slider } from "@/slider";
import {
  FC,
  FormEvent,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Picker } from "@/select";
import Button from "@/button";

import { Divider } from "@/divider";
import { OrderOptions } from "./sections/orderOptions";

import { API, OrderEntity, OrderSide, OrderType } from "@orderly/types";
import { modal } from "@/modal";
import { OrderConfirmView } from "./sections/orderConfirmView";

export interface OrderEntryProps {
  onSubmit?: () => Promise<any>;
  onDeposit?: () => Promise<void>;
  validateForm?: (values?: any) => Promise<any>;
  markPrice?: number;
  maxQty: number;

  symbol: string;

  symbolConfig: API.SymbolExt;

  freeCollateral?: number;

  // 订单表单数据
  values?: OrderEntity;
  setValue?: (name: keyof OrderEntity, value: any) => void;
  errors?: any;
  submitCount?: number;

  showConfirm?: boolean;
  onConfirmChange?: (value: boolean) => void;
}

interface OrderEntryRef {
  reset: () => void;
  setValues: (values: Partial<OrderEntity>) => void;
  setValue: (name: keyof OrderEntity, value: any) => void;
}

const { Segmented: SegmentedButton } = Button;

export const OrderEntry = forwardRef<OrderEntryRef, OrderEntryProps>(
  (props, ref) => {
    const {
      values,
      setValue,
      freeCollateral,
      symbolConfig,
      errors,
      maxQty,
      symbol,
      submitCount = 0,
    } = props;

    // console.log("render OrderEntry", errors);

    const [buttonText, setButtonText] = useState<string>("Buy / Long");

    const priceInputRef = useRef<HTMLInputElement | null>(null);

    const onSubmit = useCallback(
      (event: FormEvent) => {
        event.preventDefault();
        //check need show confirm

        props
          .validateForm?.()
          .then((errors) => {
            console.log("errors:::", errors);
            const keys = Object.keys(errors);
            if (keys.length > 0) {
              throw errors;
            }
            if (props.showConfirm) {
              return modal.confirm({
                title: "Confirm Order",
                content: (
                  <OrderConfirmView
                    order={values!}
                    symbol={symbol}
                    base={symbolConfig["base"]}
                    quote={symbolConfig.quote}
                  />
                ),
              });
            }
            return true;
          })
          .then((isOk) => {
            console.log("isOk:::", isOk);
            return props.onSubmit?.();
          })
          .then((res) => {
            console.log("component:", res);
          })
          .catch((err) => {
            console.log("order entry::", err);
          });
      },
      [values, symbol]
    );

    const onDeposit = useCallback((event: FormEvent) => {
      event.preventDefault();
      props.onDeposit?.();
    }, []);

    useEffect(() => {
      if (!values || values.side === OrderSide.BUY) {
        setButtonText("Buy / Long");
      } else {
        setButtonText("Sell / Short");
      }
    }, [values]);

    // useEffect(() => {
    //   if (values?.order_type === OrderType.LIMIT) {
    //     setTimeout(() => {
    //       priceInputRef.current?.focus();
    //     }, 300);
    //   }
    // }, [values]);

    return (
      <form onSubmit={onSubmit}>
        <div className="flex flex-col gap-3">
          <SegmentedButton
            buttons={[
              {
                label: "Buy",
                value: OrderSide.BUY,
                activeClassName:
                  "bg-trade-profit text-trade-profit-foreground after:bg-trade-profit",
              },
              {
                label: "Sell",
                value: OrderSide.SELL,
                activeClassName:
                  "bg-trade-loss text-trade-loss-foreground after:bg-trade-loss",
              },
            ]}
            value={values?.side ?? OrderSide.SELL}
            onClick={function (value: string, event: Event): void {
              // setValue("side", value);
              setValue?.("side", value);
            }}
          />
          <div className={"flex justify-between items-center"}>
            <div className="flex gap-1 text-gray-500 text-sm">
              <span>Free Collat.</span>
              {`${freeCollateral ?? "--"}`}
              <span>USDC</span>
            </div>
            <Button
              variant={"text"}
              color="primary"
              size={"small"}
              type="button"
              onClick={onDeposit}
            >
              Deposit
            </Button>
          </div>
          <Picker
            label={"Order Type"}
            value={values?.order_type}
            color={values?.side === OrderSide.BUY ? "buy" : "sell"}
            options={[
              { label: "Limit Order", value: "LIMIT" },
              {
                label: "Market Order",
                value: "MARKET",
              },
            ]}
            onValueChange={(value: any) => {
              setValue?.("order_type", value.value);
            }}
          />
          <Input
            ref={priceInputRef}
            prefix={"Price"}
            suffix={symbolConfig?.quote}
            error={!!props.errors?.order_price}
            helpText={props.errors?.order_price}
            value={
              values?.order_type === OrderType.MARKET
                ? "Market"
                : values?.order_price
            }
            className="text-right"
            readOnly={values?.order_type === OrderType.MARKET}
            onChange={(event) => {
              setValue?.("order_price", event.target.value);
            }}
          />
          <Input
            prefix={"Qunatity"}
            suffix={symbolConfig?.base}
            value={values?.order_quantity}
            className="text-right"
            error={!!props.errors?.order_quantity}
            helpText={props.errors?.order_quantity}
            onChange={(event) => {
              setValue?.("order_quantity", event.target.value);
            }}
          />
          <div>
            <Slider
              color={values?.side === OrderSide.BUY ? "buy" : "sell"}
              min={0}
              max={maxQty}
              markCount={4}
              step={symbolConfig?.["base_tick"]}
              value={[Number(values?.order_quantity ?? 0)]}
              onValueChange={(value) => {
                // console.log("onValueChange", value);
                if (typeof value[0] !== "undefined") {
                  setValue?.("order_quantity", value[0]);
                }
              }}
            />
          </div>
          <Input
            className={"text-right"}
            value={values?.total}
            prefix={"Total ≈"}
            suffix={symbolConfig?.quote}
            onChange={(event) => {
              // console.log(event.target.value);
              setValue?.("total", event.target.value);
            }}
          />
          <Divider />
          <OrderOptions
            showConfirm={props.showConfirm}
            onConfirmChange={props.onConfirmChange}
            values={values}
            setValue={setValue}
          />

          <Button
            type="submit"
            color={values?.side === OrderSide.BUY ? "buy" : "sell"}
            fullWidth
          >
            {buttonText}
          </Button>
        </div>
      </form>
    );
  }
);
