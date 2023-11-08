import { Logo } from "@/logo";
import { FC, useContext } from "react";
import { Market } from "./market";
import { MarketOverview } from "./marketOverview";
import { OrderlyAppContext } from "@/provider";

interface NavBarProps {
  symbol: string;
}

export const NavBar: FC<NavBarProps> = (props) => {
  const { logoUrl } = useContext(OrderlyAppContext);
  return (
    <div className="flex flex-row items-center px-3 sticky top-0 bg-base-800 z-20 border-b border-b-divider">
      <div className="grow flex flex-row items-center gap-4">
        <Market symbol={props.symbol} />
        <MarketOverview symbol={props.symbol} />
      </div>
      <Logo link={"/"} image={logoUrl} />
    </div>
  );
};
