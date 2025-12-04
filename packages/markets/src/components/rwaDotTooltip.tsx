import { isCurrentlyTrading } from "@veltodefi/hooks";
import { useTranslation } from "@veltodefi/i18n";
import { Text, Tooltip, Box } from "@veltodefi/ui";

export type RwaDotTooltipProps = {
  record: any;
};

export const RwaDotTooltip = ({ record }: RwaDotTooltipProps) => {
  const { t } = useTranslation();

  const isInTradingHours = isCurrentlyTrading(
    record.rwaNextClose,
    record.rwaStatus,
  );

  if (!record.isRwa) {
    return null;
  }

  return (
    <Tooltip
      content={
        <Text color={isInTradingHours ? "success" : "danger"}>
          {isInTradingHours
            ? t("trading.rwa.marketHours")
            : t("trading.rwa.outsideMarketHours")}
        </Text>
      }
    >
      <Box p={2}>
        <Box
          width={4}
          height={4}
          r="full"
          className={isInTradingHours ? "oui-bg-success" : "oui-bg-danger"}
        />
      </Box>
    </Tooltip>
  );
};
