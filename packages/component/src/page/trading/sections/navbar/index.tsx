import { SimpleMarketOverview } from "@/block/marketOverview";
import { Logo } from "@/logo";
import { FC } from "react";
import { Market } from "./market";

interface NavBarProps {
  symbol: string;
}

export const NavBar: FC<NavBarProps> = (props) => {
  return (
    <div className="flex flex-row items-center px-3">
      <div className="grow flex flex-row items-center gap-4">
        <Market />
        <SimpleMarketOverview change={0.1234} markPrice={312304.23} />
      </div>
      <Logo link={""} image={""} />
    </div>
  );
};
