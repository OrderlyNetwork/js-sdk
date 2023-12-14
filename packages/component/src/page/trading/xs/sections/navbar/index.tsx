import { Logo } from "@/logo";
import { FC, useContext } from "react";
import { Market } from "./market";
import { MarketOverview } from "./marketOverview";
import { OrderlyAppContext } from "@/provider";

interface NavBarProps {
  symbol: string;
}

export const NavBar: FC<NavBarProps> = (props) => {
  // const { logoUrl } = useContext(OrderlyAppContext);
  return (
    <div className="orderly-flex orderly-flex-row orderly-items-center orderly-px-3 orderly-sticky orderly-top-0 orderly-bg-base-800 orderly-z-20 orderly-border-b orderly-border-b-divider orderly-text-3xs orderly-text-base-contrast">
      <div className="orderly-grow orderly-flex orderly-flex-row orderly-items-center orderly-gap-4">
        <Market symbol={props.symbol} />
        <MarketOverview symbol={props.symbol} />
      </div>
      <Logo link={"/"} />
    </div>
  );
};
