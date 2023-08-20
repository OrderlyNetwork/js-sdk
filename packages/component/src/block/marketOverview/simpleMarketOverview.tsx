import { FC } from "react";
import { Text } from "@/text";
import { Numeral } from "@/text/numeral";

interface SimpleMarketOverviewProps {
  markPrice: number;
  change: number;
}

export const SimpleMarketOverview: FC<SimpleMarketOverviewProps> = (props) => {
  return (
    <div className={"flex gap-4"}>
      <Text>31205.80</Text>
      <Numeral rule={"percentages"}>0.1234</Numeral>
    </div>
  );
};
