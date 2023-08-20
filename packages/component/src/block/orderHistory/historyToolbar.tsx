import { Select } from "@/select";
import { CalendarDays } from "lucide-react";
import { IconButton } from "@/button";
import { SidePicker } from "@/block/pickers";

export const HistoryToolbar = () => {
  return (
    <div className="flex gap-3 py-3 px-4 items-center">
      <SidePicker />
      <Select options={[]} label="All Status" size={"small"} />
      <IconButton color="tertiary" size="small">
        <CalendarDays size={18} />
      </IconButton>
    </div>
  );
};
