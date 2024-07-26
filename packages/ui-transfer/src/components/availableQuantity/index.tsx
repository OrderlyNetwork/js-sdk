import { FC } from "react";
import { Flex, Text } from "@orderly.network/ui";

export type AvailableQuantityProps = {
  maxAmount?: string;
  onClick?: () => void;
};

export const AvailableQuantity: FC<AvailableQuantityProps> = (props) => {
  return (
    <Flex justify="between" px={2}>
      <Text size="2xs" intensity={36}>
        $0
      </Text>

      <Flex gapX={2}>
        <Text size="2xs" intensity={36}>
          Available: {props.maxAmount} USDC
        </Text>

        <Text
          size="2xs"
          color="primaryLight"
          className="oui-cursor-pointer oui-select-none"
          onClick={props.onClick}
        >
          Max
        </Text>
      </Flex>
    </Flex>
  );
};
