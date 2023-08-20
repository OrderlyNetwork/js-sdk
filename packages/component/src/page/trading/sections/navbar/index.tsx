import { SimpleMarketOverview } from "@/block/marketOverview";
import { Logo } from "@/logo";
import { ChevronDown } from "lucide-react";
import { FC } from "react";

interface NavBarProps {
  symbol: string;
}

export const NavBar: FC<NavBarProps> = (props) => {
  return (
    <div className="flex flex-row items-center px-3">
      <div className="grow flex flex-row items-center gap-4">
        <button className={"flex items-center"}>
          <span>BTC-PERP</span>
          <ChevronDown size={16} />
        </button>
        <SimpleMarketOverview change={0.1234} markPrice={312304.23} />
      </div>
      <Logo link={""} image={""} />
    </div>
  );
};
