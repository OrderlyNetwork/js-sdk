import { CardTitle, Flex } from "@kodiak-finance/orderly-ui";
import { useTranslation } from "@kodiak-finance/orderly-i18n";

export const AssetsChartHeader = () => {
  const { t } = useTranslation();

  return (
    <Flex justify={"between"}>
      <CardTitle>{t("common.assets")}</CardTitle>
    </Flex>
  );
};
