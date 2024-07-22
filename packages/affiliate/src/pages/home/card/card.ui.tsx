import { FC } from "react";
import { Flex, Text } from "@orderly.network/ui";
import { CardReturns } from "./card.script";
import { AsAnAffiliateWidget } from "../asAnAffilate";
import { AsATraderWidget } from "../asATrader";

export const CardUI: FC<CardReturns> = (props) => {
  if (typeof props.overwrite === "function") {
    return props.overwrite?.(props.state);
  }
  return (
    <Flex className="oui-flex oui-flex-col xl:oui-flex-row oui-gap-6 xl:oui-gap-[36px] oui-w-full oui-items-stretch">
      <AsAnAffiliateWidget />
      <AsATraderWidget />
    </Flex>
  );
};
