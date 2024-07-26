import { FC } from "react";
import { Flex, Text } from "@orderly.network/ui";
import { API } from "@orderly.network/types";

export type AvailableQuantityProps = {
  token?: API.TokenInfo;
  amount?: string;
  maxAmount?: string;
  onClick?: () => void;
};

export const AvailableQuantity: FC<AvailableQuantityProps> = (props) => {
  const { amount, maxAmount, token } = props;

  const name = token?.display_name || token?.symbol || "";

  return (
    <Flex justify="between" px={2}>
      <Text size="2xs" intensity={36}>
        ${amount}
      </Text>

      <Flex gapX={2}>
        <Text size="2xs" intensity={36}>
          Available: {maxAmount} {name}
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
