import { FC, useMemo } from "react";
import { Flex, Text } from "@orderly.network/ui";
import { useAppConfig } from "@orderly.network/react-app";

export type BrokerWalletProps = {
  name?: string;
};

export const BrokerWallet: FC<BrokerWalletProps> = (props) => {
  const { appIcons } = useAppConfig();

  const icon = useMemo(() => {
    const { secondary } = appIcons || {};

    if (!secondary?.img && secondary?.component) return null;

    if (secondary?.img) {
      return <img src={secondary?.img} className="oui-w-5 oui-h-5" />;
    }

    if (secondary?.component) {
      return <>{secondary.component}</>;
    }
  }, [appIcons]);

  return (
    <Flex justify="between">
      <Text size="sm">{`Your ${props.name} account`}</Text>
      {icon}
    </Flex>
  );
};
