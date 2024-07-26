import { FC, useMemo } from "react";
import { Flex, Text } from "@orderly.network/ui";
import { useAppConfig } from "@orderly.network/react-app";

export type BrokerWalletProps = {
  name?: string;
};

export const BrokerWallet: FC<BrokerWalletProps> = (props) => {
  const { appIcons } = useAppConfig();

  const icon = useMemo(() => {
    if (!appIcons?.secondary?.img && !appIcons?.secondary?.component)
      return null;

    if (appIcons?.secondary?.img) {
      return <img src={appIcons?.secondary?.img} className="oui-w-5 oui-h-5" />;
    }

    if (appIcons?.secondary?.component) {
      return <>{appIcons.secondary.component}</>;
    }
  }, [appIcons]);

  return (
    <Flex justify="between">
      <Text size="sm">{`Your ${props.name} account`}</Text>
      {icon}
    </Flex>
  );
};
