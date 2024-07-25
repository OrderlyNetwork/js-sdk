import { FC, ReactNode } from "react";
import { Flex, Text } from "@orderly.network/ui";

export type BrokerWalletProps = {
  name?: string;
  icon?: ReactNode;
};

export const BrokerWallet: FC<BrokerWalletProps> = (props) => {
  return (
    <Flex justify="between">
      <Text size="sm">{`Your ${props.name} account`}</Text>
      {props.icon}
    </Flex>
  );
};
