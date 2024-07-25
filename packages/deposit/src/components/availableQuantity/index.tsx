import { FC } from "react";
import { Flex, Text } from "@orderly.network/ui";

export type AvailableQuantityProps = {
  maxAmount?: string;
  onMax?: () => void;
};

export const AvailableQuantity: FC<AvailableQuantityProps> = (props) => {
  return (
    <Flex justify="between">
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
          className="oui-cursor-pointer"
          onClick={props.onMax}
        >
          Max
        </Text>
      </Flex>
    </Flex>
  );
};
