import { useTranslation } from "@orderly.network/i18n";
import { Flex, RwaIcon, Text } from "@orderly.network/ui";

const RwaIconTab = (props: { iconSize?: number }) => {
  const { iconSize = 12 } = props;
  const { t } = useTranslation();
  return (
    <Flex gap={1}>
      <RwaIcon
        size={iconSize}
        className="group-data-[state=active]:oui-text-base-contrast group-data-[state=inactive]:oui-text-base-contrast-36"
      />
      <Text>{t("common.rwa")}</Text>
    </Flex>
  );
};

const RwaTab = () => {
  const { t } = useTranslation();
  return (
    <Flex gap={1}>
      <Text>{t("common.rwa")}</Text>
    </Flex>
  );
};

export { RwaIconTab, RwaTab };
