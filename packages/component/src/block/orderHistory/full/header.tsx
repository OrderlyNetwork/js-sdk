import { FC, useMemo, useState } from "react";
import { Select } from "@/select";
import Button from "@/button";
import { modal } from "@orderly.network/ui";
import { OrderSide, OrderStatus } from "@orderly.network/types";
import { SIDE_OPTIONS, STATUS_OPTIONS } from "../shared/constants";

export interface Props {
  onSideChange?: (side: OrderSide) => void;
  onStatusChange?: (status: OrderStatus) => void;
  side: OrderSide | "";
  status: OrderStatus | "";
  // count: number;
}

export const Header: FC<Props> = (props) => {
  //   const [side, setSide] = useState<OrderSide | "">("");

  const sideOptions = useMemo(() => {
    return SIDE_OPTIONS;
  }, []);
  const statusOptions = useMemo(() => {
    return STATUS_OPTIONS;
  }, []);

  return (
    <div
      className={
        "orderly-flex orderly-justify-between orderly-items-center orderly-py-3"
      }
    >
      <div className="orderly-flex orderly-gap-2">
        <Select
          size={"small"}
          options={sideOptions}
          value={props.side}
          onChange={(value) => {
            //   setSide(value as OrderSide);
            props.onSideChange?.(value as OrderSide);
            // props.onSearch?.({ side: value as OrderSide });
          }}
        />
        <Select
          size={"small"}
          options={statusOptions}
          value={props.status}
          onChange={(value) => {
            props.onStatusChange?.(value as OrderStatus);
            // props.onSearch?.({ side: value as OrderSide });
          }}
        />
      </div>
    </div>
  );
};
