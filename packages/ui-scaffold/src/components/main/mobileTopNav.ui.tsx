import { Flex, Text } from "@orderly.network/ui";
import { ChainMenuWidget } from "../chainMenu";
import { WalletConnectButtonExtension } from "../accountMenu/menu.widget";
import { useTranslation } from "@orderly.network/i18n";
export const MobileTopNav = () => {
  const { t } = useTranslation();
  return (
    <Flex
      width={"100%"}
      height={44}
      px={3}
      itemAlign={"center"}
      justify={"between"}
    >
      <Flex>
        <Text className="oui-text-2xl oui-font-bold oui-text-base-contrast-98">{t("common.portfolio")}</Text>
      </Flex>
      <Flex gapX={2}>
        <ChainMenuWidget />
        <WalletConnectButtonExtension />
      </Flex>
    </Flex>
  );
};
