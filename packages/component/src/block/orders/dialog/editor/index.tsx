import Button from "@/button";
import { Divider } from "@/divider";
import { Input } from "@/input";
import { Slider } from "@/slider";
import { Statistic } from "@/statistic";
import { FC } from "react";

interface OrderEditFormProps {
  symbol: string;
  order: any;
  onSubmit?: (values: any) => void;
}

export const OrderEditForm: FC<OrderEditFormProps> = (props) => {
  const onConfirm = () => {
    props.onSubmit?.({});
  };

  return (
    <>
      <div className="py-3">{props.symbol}</div>
      <div className="grid grid-cols-2">
        <Statistic
          label="Order Type"
          value="Limit Buy"
          labelClassName="text-sm text-base-contrast/30"
        />
        <Statistic
          label="Last Price"
          value="1000.00"
          labelClassName="text-sm text-base-contrast/30"
        />
      </div>
      <Divider className="py-5" />
      <div className="flex flex-col gap-5">
        <Input prefix="Price" suffix="USDC" />
        <Input prefix="Quantity" suffix="BTC" />
      </div>

      <div className="py-5">
        <Slider color={"primary"} />
      </div>

      <div className="grid grid-cols-2 gap-3 py-5">
        <Button fullWidth color={"secondary"}>
          Cancel
        </Button>
        <Button fullWidth onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </>
  );
};
