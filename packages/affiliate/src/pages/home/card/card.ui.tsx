import { FC } from "react";
import { Flex, Text } from "@orderly.network/ui";
import { CardReturns } from "./card.script";
import { AsAnAffiliateWidget } from "../asAnAffilate";
import { AsTraderWidget } from "../asATrader";

export const Card: FC<CardReturns> = (props) => {
  if (typeof props.overwrite === "function") {
    return props.overwrite?.(props.state);
  }
  return (
    <Flex
      id="oui-affiliate-home-card"
      className="oui-flex oui-flex-col xl:oui-flex-row oui-gap-6 xl:oui-gap-[36px] oui-w-full oui-items-stretch"
    >
      <AsAnAffiliateWidget />
      <AsTraderWidget />
    </Flex>
  );
};
