import { FC } from "react";
import { Text } from "@/text";
import { NetworkImage } from "@/icon";
import { Divider } from "@/divider";
import { ChevronDown } from "lucide-react";

export const Markets: FC<{ symbol: string }> = ({ symbol }) => {
  return (
    <>
      <button className="orderly-px-2 orderly-flex orderly-items-center orderly-gap-1 orderly-h-full">
        <NetworkImage type="symbol" symbol={symbol} size={"small"} />

        <Text
          rule="symbol"
          className="orderly-text-xs orderly-break-normal orderly-whitespace-nowrap"
        >
          {symbol}
        </Text>

        <ChevronDown size={14} />
      </button>
    </>
  );
};
