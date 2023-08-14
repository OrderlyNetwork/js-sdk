import Button from "@/button";
import { Divider } from "@/divider";
import { Input } from "@/input";
import { Statistic } from "@/statistic";
import { FC } from "react";

interface OrderEditFormDialogProps {
  symbol: string;
  order: any;
  onSubmit?: (values: any) => void;
}

export const OrderEditFormDialog: FC<OrderEditFormDialogProps> = (props) => {
  const onConfirm = () => {
    props.onSubmit?.({});
  };

  return (
    <div>
      <div>{props.symbol}</div>
      <div className="grid grid-cols-2">
        <Statistic label="Order Type" value="Limit Buy" />
        <Statistic label="Last Price" value="1,000.00" />
      </div>
      <Divider />
      <div className="flex flex-col gap-2">
        <Input />
        <Input />
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <Button fullWidth color={"tertiary"}>
          Cancel
        </Button>
        <Button fullWidth onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </div>
  );
};
