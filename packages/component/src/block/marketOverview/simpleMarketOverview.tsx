import { FC, useContext } from "react";
import { Numeral } from "@/text/numeral";
import { SymbolContext } from "@/provider";

interface SimpleMarketOverviewProps {
  price: number;
  change: number;
}

export const SimpleMarketOverview: FC<SimpleMarketOverviewProps> = (props) => {
  const { quote_dp } = useContext(SymbolContext);
  //
  return (
    <div className={"flex gap-4 items-center"}>
      <Numeral precision={quote_dp}>{props.price}</Numeral>
      <Numeral rule={"percentages"} coloring>
        {props.change}
      </Numeral>
    </div>
  );
};
