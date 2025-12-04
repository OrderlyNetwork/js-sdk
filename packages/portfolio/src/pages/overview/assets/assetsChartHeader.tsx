import { CardTitle, Flex } from "@veltodefi/ui";
import { useTranslation } from "@veltodefi/i18n";

export const AssetsChartHeader = () => {
  const { t } = useTranslation();

  return (
    <Flex justify={"between"}>
      <CardTitle>{t("common.assets")}</CardTitle>
    </Flex>
  );
};
