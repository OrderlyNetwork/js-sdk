import { Logo } from "@/logo";
import { FC, useContext } from "react";
import { Market } from "./market";
import { MarketOverview } from "./marketOverview";
import { OrderlyContext } from "@orderly.network/hooks";

interface NavBarProps {
  symbol: string;
}

export const NavBar: FC<NavBarProps> = (props) => {
  const { logoUrl } = useContext(OrderlyContext);
  return (
    <div className="flex flex-row items-center px-3 sticky top-0 bg-base-100 z-20">
      <div className="grow flex flex-row items-center gap-4">
        <Market symbol={props.symbol} />
        <MarketOverview symbol={props.symbol} />
      </div>
      <Logo link={"/"} image={logoUrl} />
    </div>
  );
};
