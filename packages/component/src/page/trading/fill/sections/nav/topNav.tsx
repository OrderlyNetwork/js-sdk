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
      <Ticker symbol={props.symbol} />
    </div>
  );
};
