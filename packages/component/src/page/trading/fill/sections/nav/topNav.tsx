import { Divider } from "@/divider";
import { Markets } from "./markets";
import { Ticker } from "./ticker";
import { FC } from "react";

interface NavBarProps {
  symbol: string;
}

export const TopNav: FC<NavBarProps> = (props) => {
  return (
    <div
      className={
        "orderly-h-full orderly-flex orderly-items-center orderly-relative"
      }
    >
      <Markets symbol={props.symbol} />
      <Divider vertical className="orderly-mx-2" />
      <Ticker symbol={props.symbol} />
    </div>
  );
};
