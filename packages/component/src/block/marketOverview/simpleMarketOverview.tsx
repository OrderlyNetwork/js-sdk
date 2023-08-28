import { FC } from "react";
import { Text } from "@/text";
import { Numeral } from "@/text/numeral";

interface SimpleMarketOverviewProps {
  price: number;
  change: number;
}

export const SimpleMarketOverview: FC<SimpleMarketOverviewProps> = (props) => {
  return (
    <div className={"flex gap-4 items-center"}>
      <Numeral>{props.price}</Numeral>
      <Numeral rule={"percentages"} coloring>
        {props.change}
      </Numeral>
    </div>
  );
};
