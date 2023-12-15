import { Divider } from "@/divider";
import { Markets } from "./markets";
import { Ticker } from "./ticker";
import { FC } from "react";
import { SymbolProvider } from "@/provider";

interface NavBarProps {
  symbol: string;
}

export const TopNav: FC<NavBarProps> = (props) => {
  return (
    <SymbolProvider symbol={props.symbol}>
      <div
        className={
          "orderly-h-full orderly-flex orderly-items-center orderly-relative orderly-pl-1"
        }
      >
        <Markets symbol={props.symbol} />
        <Divider vertical className="orderly-mx-2" />

        <Ticker symbol={props.symbol} />
      </div>
    </SymbolProvider>
  );
};
