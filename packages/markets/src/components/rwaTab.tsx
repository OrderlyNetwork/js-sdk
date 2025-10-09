import { useTranslation } from "@orderly.network/i18n";
import { Box, Flex, GradientText, Text } from "@orderly.network/ui";

export const RwaTab = () => {
  const { t } = useTranslation();
  return (
    <Flex gap={1}>
      <Text>{t("common.rwa")}</Text>
      <Box
        r="base"
        px={2}
        className="oui-bg-gradient-to-r oui-from-[rgb(var(--oui-gradient-brand-start)_/_0.12)] oui-to-[rgb(var(--oui-gradient-brand-end)_/_0.12)]"
      >
        <GradientText color="brand">{t("common.new")}</GradientText>
      </Box>
    </Flex>
  );
};
