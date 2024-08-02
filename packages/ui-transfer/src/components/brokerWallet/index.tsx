import { FC, useMemo } from "react";
import { Flex, Text } from "@orderly.network/ui";
import { useAppConfig } from "@orderly.network/react-app";
import { useConfig } from "@orderly.network/hooks";

export const BrokerWallet: FC = () => {
  const { appIcons } = useAppConfig();
  const brokerName = useConfig("brokerName");

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
      <Text size="sm">{`Your ${brokerName} account`}</Text>
      {icon}
    </Flex>
  );
};
