import { Logo } from "@/logo";
import { FC } from "react";
import { Market } from "./market";
import { MarketOverview } from "./marketOverview";

interface NavBarProps {
  symbol: string;
}

export const NavBar: FC<NavBarProps> = (props) => {
  return (
    <div className="flex flex-row items-center px-3">
      <div className="grow flex flex-row items-center gap-4">
        <Market symbol={props.symbol} />
        <MarketOverview symbol={props.symbol} />
      </div>
      <Logo link={""} image={""} />
    </div>
  );
};
