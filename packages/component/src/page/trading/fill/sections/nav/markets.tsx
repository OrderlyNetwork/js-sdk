import { FC, useState } from "react";
import { Text } from "@/text";
import { NetworkImage } from "@/icon";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/dropdown/dropdown";
import { MemoizedMarkets } from "./myMarkets";

export const Markets: FC<{ symbol: string }> = ({ symbol }) => {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="orderly-px-2 orderly-flex orderly-items-center orderly-gap-1 orderly-h-full">
          <NetworkImage type="symbol" symbol={symbol} size={"small"} />

          <Text
            rule="symbol"
            className="orderly-text-xs orderly-break-normal orderly-whitespace-nowrap orderly-font-semibold"
          >
            {symbol}
          </Text>

          {/*@ts-ignore*/}
          <ChevronDown size={14} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        onCloseAutoFocus={(e) => e.preventDefault()}
        align={"start"}
        className={"orderly-w-[580px] orderly-py-5 orderly-bg-base-900"}
      >
        <MemoizedMarkets onClose={() => setOpen(false)} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
