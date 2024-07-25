import { FC } from "react";
import { Flex, Text, WalletIcon } from "@orderly.network/ui";
import { formatAddress } from "../../utils";

export type Web3WalletProps = {
  name?: string;
  address?: string;
};

export const Web3Wallet: FC<Web3WalletProps> = (props) => {
  const formatedAddress = formatAddress(props.address);

  return (
    <Flex justify="between">
      <Text size="sm">Your Web3 Wallet</Text>

      <Flex gapX={1}>
        <WalletIcon name={props.name!} />
        <Text size="sm" intensity={54}>
          {formatedAddress}
        </Text>
      </Flex>
    </Flex>
  );
};
