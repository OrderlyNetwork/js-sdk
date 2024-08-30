import { Picker, Select } from "@/select";
import { CalendarDays } from "lucide-react";
import { IconButton } from "@/button";
import { SidePicker } from "@/block/pickers";
import { OrderSide, OrderStatus, OrderType } from "@orderly.network/types";

import { FC, useMemo, useState } from "react";
import { SIDE_OPTIONS, STATUS_OPTIONS } from "./shared/constants";

interface HistoryToolbarProps {
  side?: OrderSide | "";
  status?: OrderStatus | "";
  onSideChange?: (side: OrderSide) => void;
  onStatusChange?: (status: OrderStatus) => void;
}

export const HistoryToolbar: FC<HistoryToolbarProps> = (props) => {
  const sideOptions = useMemo(() => {
    return SIDE_OPTIONS;
  }, []);
  const statusOptions = useMemo(() => {
    return STATUS_OPTIONS;
  }, []);

  return (
    <div className="orderly-data-list-filter orderly-flex orderly-gap-3 orderly-py-3 orderly-px-4 orderly-items-center">
      {/* <SidePicker /> */}
      <Picker
        options={sideOptions}
        size={"small"}
        value={props.side ?? ""}
        onValueChange={(item) => props.onSideChange?.(item.value)}
        className="orderly-text-3xs orderly-text-base-contrast-54"
      />
      {/* <Select options={status} label="All status" size={"small"} /> */}
      <Picker
        options={statusOptions}
        size={"small"}
        value={props.status ?? ""}
        onValueChange={(item) => props.onStatusChange?.(item.value)}
        className="orderly-text-3xs orderly-text-base-contrast-54"
      />
      {/* <IconButton color="tertiary" size="small">
        <CalendarDays size={18} />
      </IconButton> */}
    </div>
  );
};
