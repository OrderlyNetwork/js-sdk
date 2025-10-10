import { useGetRwaSymbolOpenStatus } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { cn, Flex, Text } from "@orderly.network/ui";

export const RwaStatusTag = ({ symbol }: { symbol: string }) => {
  const { isRwa, open } = useGetRwaSymbolOpenStatus(symbol);
  const { t } = useTranslation();

  if (!isRwa) {
    return null;
  }

  return (
    <Flex
      r="base"
      px={2}
      height={18}
      className={cn(
        "oui-shrink-0",
        open ? "oui-bg-success/15" : "oui-bg-danger/15",
      )}
    >
      <Text size="2xs" color={open ? "success" : "danger"}>
        {open
          ? t("trading.rwa.marketHours")
          : t("trading.rwa.outsideMarketHours")}
      </Text>
    </Flex>
  );
};
