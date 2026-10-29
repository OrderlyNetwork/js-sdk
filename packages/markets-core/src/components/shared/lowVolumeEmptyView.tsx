import { useTranslation } from "@orderly.network/i18n";
import { Button, Flex, Text } from "@orderly.network/ui";
import { useLowVolumeMarketFilter } from "./lowVolumeMarketFilter";

export const LowVolumeEmptyView = () => {
  const { t } = useTranslation();
  const { setShowLowVolume } = useLowVolumeMarketFilter();

  return (
    <Flex direction="column" itemAlign="center" gapY={3} className="oui-w-full">
      <Text
        as="div"
        size="2xs"
        intensity={54}
        className="oui-w-full oui-px-3 oui-text-center"
      >
        {t("markets.strictVolumeFilter.empty")}
      </Text>
      <Button
        variant="text"
        color="primary"
        size="xs"
        onClick={() => setShowLowVolume(true)}
      >
        {t("markets.strictVolumeFilter.action")}
      </Button>
    </Flex>
  );
};
