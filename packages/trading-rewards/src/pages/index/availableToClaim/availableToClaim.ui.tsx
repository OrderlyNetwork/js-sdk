import { Flex, Text } from "@orderly.network/ui";
import { JumpIcon } from "../components/jumpIcon";
import { FC } from "react";
import { EsOrderlyIcon } from "../components/esOrderlyIcon";
import { OrderlyIcon } from "../components/orderlyIcon";
import { AvailableReturns } from "./availableToClaim.script";

export const AvailableToClaimUI: FC<AvailableReturns> = (props) => {
  return (
    <Flex
      p={6}
      r="2xl"
      direction={"column"}
      gap={4}
      width={"100%"}
      className=" oui-font-semibold oui-bg-base-9 "
    >
      <Flex direction={"row"} justify={"between"} width={"100%"}>
        <Text className="oui-text-lg">Available to claim</Text>
        <Flex
          direction={"row"}
          gap={1}
          onClick={props.goToClaim}
          className="oui-cursor-pointer"
        >
          <Text color="primary" size="sm">
            Go to Claim
          </Text>
          <JumpIcon />
        </Flex>
      </Flex>
      <Flex direction={"row"} gap={3} width={"100%"}>
        <Statics title="ORDER" value={props.order} />
        <Statics title="esORDER" value={props.esorder} isEsOrder />
      </Flex>
    </Flex>
  );
};

const Statics: FC<{
  title: string;
  isEsOrder?: boolean;
  value?: number;
}> = (props) => {
  return (
    <Flex
      className="oui-flex-1 oui-bg-base-8 oui-py-[11px]"
      direction={"column"}
      gap={2}
      r="2xl"
    >
      <Text className="oui-text-xs xl:oui-text-sm oui-text-base-contrast-54">
        {props.title}
      </Text>
      <Flex direction={"row"} gap={1}>
        {props.isEsOrder ? <EsOrderlyIcon /> : <OrderlyIcon />}
        <Text.numeral
          rule={"price"}
          className="oui-text-sm xl:oui-text-base"
          children={props.value || "-"}
          dp={2}
        />
      </Flex>
    </Flex>
  );
};
