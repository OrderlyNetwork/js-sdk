import { Picker, Select } from "@/select";
import { CalendarDays } from "lucide-react";
import { IconButton } from "@/button";
import { SidePicker } from "@/block/pickers";
import { OrderSide, OrderStatus, OrderType } from "@orderly.network/types";

import { FC, useMemo, useState } from "react";

interface HistoryToolbarProps {
  side?: OrderSide | "";
  status?: OrderStatus | "";
  onSideChange?: (side: OrderSide) => void;
  onStatusChange?: (status: OrderStatus) => void;
}

export const HistoryToolbar: FC<HistoryToolbarProps> = (props) => {
  const sideOptions = useMemo(() => {
    return [
      {
        label: "All sides",
        value: "",
      },
      {
        label: "Buy",
        value: OrderSide.BUY,
      },
      {
        label: "Sell",
        value: OrderSide.SELL,
      },
    ];
  }, []);
  const statusOptions = useMemo(() => {
    return [
      {
        label: "All status",
        value: "",
      },
      {
        label: "Pending",
        value: OrderStatus.NEW,
      },
      {
        label: "Filled",
        value: OrderStatus.FILLED,
      },
      {
        label: "Partially filled",
        value: OrderStatus.PARTIAL_FILLED,
      },
      {
        label: "Cancelled",
        value: OrderStatus.CANCELLED,
      },
      {
        label: "Rejected",
        value: OrderStatus.REJECTED,
      },
    ];
  }, []);

  return (
    <div className="orderly-flex orderly-gap-3 orderly-py-3 orderly-px-4 orderly-items-center">
      {/* <SidePicker /> */}
      <Picker
        options={sideOptions}
        size={"small"}
        value={props.side ?? ""}
        onValueChange={(item) => props.onSideChange?.(item.value)}
        className="orderly-bg-base-contrast-20 orderly-text-4xs orderly-text-base-contrast-54"
      />
      {/* <Select options={status} label="All status" size={"small"} /> */}
      <Picker
        options={statusOptions}
        size={"small"}
        value={props.status ?? ""}
        onValueChange={(item) => props.onStatusChange?.(item.value)}
        className="orderly-bg-base-contrast-20 orderly-text-4xs orderly-text-base-contrast-54"
      />
      {/* <IconButton color="tertiary" size="small">
        <CalendarDays size={18} />
      </IconButton> */}
    </div>
  );
};
