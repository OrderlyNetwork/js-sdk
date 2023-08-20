import { InputMask } from "@/input/inputMask";
import { Input } from "@/input";

import { Slider } from "@/slider";
import {
  FC,
  FormEvent,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Picker, Select } from "@/select";
import { Switch } from "@/switch";
import Button from "@/button";
import { OrderSide, OrderType, OrderValue } from "./types";
import { RadioGroup, Radio } from "@/radioGroup";
import { Checkbox } from "@/checkbox/checkbox";
import { Label } from "@/label";
import { Divider } from "@/divider";
import { Collapsible, CollapsibleContent } from "@/collapsible";
import { OrderOptions } from "./sections/orderOptions";

export interface OrderEntryProps {
  onSubmit?: (value: OrderValue) => Promise<any>;
  onDeposit?: () => Promise<void>;
  markPrice?: number;
  // maxQty:number;

  pair: string;
  available: number;
  collateral?: number;
}

interface OrderEntryRef {
  reset: () => void;
  setValues: (values: Partial<OrderValue>) => void;
  setValue: (name: keyof OrderValue, value: any) => void;
}

const { SegmentedButton } = Button;

export const OrderEntry = forwardRef<OrderEntryRef, OrderEntryProps>(
  (props, ref) => {
    useImperativeHandle(
      ref,
      () => {
        return {
          reset: () => {},
          setValues: (values: any) => {},
          setValue: (name: string, value: any) => {},
        };
      },
      []
    );

    const [values, setValues] = useState<OrderValue>({
      side: OrderSide.Buy,
      type: OrderType.Limit,
      price: "",
      qty: "",
      symbol: props.pair,
    });

    const [buttonText, setButtonText] = useState<string>("Buy / Long");

    const onSubmit = useCallback(
      (event: FormEvent) => {
        event.preventDefault();
        props.onSubmit?.({
          // symbol: props.pair,
          ...values,
        });
      },
      [values]
    );

    const onDeposit = useCallback((event: FormEvent) => {
      event.preventDefault();
      props.onDeposit?.();
    }, []);

    const setValue = useCallback((name: string, value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }));
    }, []);

    useEffect(() => {
      if (values.side === OrderSide.Buy) {
        setButtonText("Buy / Long");
      } else {
        setButtonText("Sell / Short");
      }
    }, [values.side]);

    return (
      <form onSubmit={onSubmit}>
        <div className="flex flex-col gap-3">
          <SegmentedButton
            buttons={[
              {
                label: "Buy",
                value: "buy",
                activeClassName:
                  "bg-trade-profit text-trade-profit-foreground after:bg-trade-profit",
              },
              {
                label: "Sell",
                value: "sell",
                activeClassName:
                  "bg-trade-loss text-trade-loss-foreground after:bg-trade-loss",
              },
            ]}
            value={values.side}
            onClick={function (value: string, event: Event): void {
              setValue("side", value);
            }}
          />
          <div className={"flex justify-between items-center"}>
            <div className="flex gap-1 text-gray-500 text-sm">
              <span>Free Collat.</span>
              {`${props.collateral ?? "--"}`}
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
            label={"Limit Order"}
            value={values.type}
            color={values.side === OrderSide.Buy ? "buy" : "sell"}
            options={[
              { label: "Limit Order", value: "limit" },
              {
                label: "Market Order",
                value: "market",
              },
            ]}
            onValueChange={(value) => {
              setValue("type", value);
            }}
          />
          <Input
            prefix={"Price"}
            suffix={"USDC"}
            value={values.price}
            className="text-right"
            onChange={(event) => {
              console.log(event.target.value);
              setValue("price", event.target.value);
            }}
          />
          <Input
            prefix={"Qunatity"}
            suffix={"BTC"}
            value={values.qty}
            className="text-right"
            onChange={(event) => {
              console.log(event.target.value);
              setValue("qty", event.target.value);
            }}
          />
          <div>
            <Slider
              color={values.side === OrderSide.Buy ? "buy" : "sell"}
              step={25}
            />
          </div>
          <Input
            className={"text-right"}
            readOnly
            prefix={"Total"}
            suffix={"USDC"}
          />
          <Divider />
          <OrderOptions />

          <Button
            type="submit"
            color={values.side === OrderSide.Buy ? "buy" : "sell"}
            fullWidth
          >
            {buttonText}
          </Button>
        </div>
      </form>
    );
  }
);
