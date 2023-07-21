import { InputMask } from "@/input/inputMask";
import { Input } from "../../input";
import { Button, SegmentedButton } from "@/button";
import { Slider } from "@/slider";
import {
  FC,
  FormEvent,
  FormEventHandler,
  forwardRef,
  useCallback,
  useImperativeHandle,
} from "react";
import { Select } from "@/select";

export interface OrderEntryProps {
  onSubmit?: (value: any) => Promise<any>;
}

interface OrderEntryRef {
  reset: () => void;
  setValues: (values: any) => void;
  setValue: (name: string, value: any) => void;
}

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

    const onSubmit = useCallback((event: FormEvent) => {
      event.preventDefault();
      props.onSubmit?.(event);
    }, []);

    return (
      <form onSubmit={onSubmit}>
        <div className="flex flex-col gap-2">
          <SegmentedButton
            buttons={[
              { label: "Buy", value: "buy" },
              { label: "Sell", value: "sell" },
            ]}
            value="buy"
            onClick={function (value: string, event: Event): void {
              throw new Error("Function not implemented.");
            }}
          />
          <Select label={"Limit Order"} />
          <Input
            prefix={<InputMask>Price</InputMask>}
            suffix={<InputMask>USDC</InputMask>}
          />
          <Input
            prefix={<InputMask>Qunatity</InputMask>}
            suffix={<InputMask>BTC</InputMask>}
          />
          <Slider />
          <Input
            prefix={<InputMask>Total ~</InputMask>}
            suffix={<InputMask>USDC</InputMask>}
          />
          <Button type="submit">Buy/Long</Button>
        </div>
      </form>
    );
  }
);
