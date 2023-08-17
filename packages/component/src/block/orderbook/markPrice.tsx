import { cn } from "@/utils/css";
import { Flag } from "lucide-react";

export const MarkPrice = () => {
  return (
    <div className="py-2 flex justify-between">
      <div className={cn("text-trade-profit font-semibold text-[15px]")}>
        1,346.00
      </div>
      <div className={"text-sm flex items-center gap-1"}>
        <Flag size={14} className={"text-yellow-400"} />
        <span>1,634.00</span>
      </div>
    </div>
  );
};
