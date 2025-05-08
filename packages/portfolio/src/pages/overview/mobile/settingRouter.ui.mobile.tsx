import { FC } from "react";
import { Flex, Text, SettingFillIcon, ChevronRightIcon } from "@orderly.network/ui";
import { useTranslation } from "@orderly.network/i18n";

export const SettingRouterMobile: FC = () => {
  const { t } = useTranslation();
  return <Flex direction={"row"} width={"100%"} className="oui-p-4 oui-items-center oui-gap-2 oui-bg-base-9 oui-rounded-xl oui-cursor-pointer">
    <SettingFillIcon size={18} opacity={0.98} color="white" />
    <Text className="oui-text-base oui-font-semibold oui-text-base-contrast-80">{t("portfolio.setting")}</Text>
    <ChevronRightIcon className="oui-ml-auto" size={18} opacity={0.36} color="white" />
  </Flex>;
};

