import { useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { cn, Flex, TokenIcon, useScreen } from "@orderly.network/ui";
import type { Column } from "@orderly.network/ui";
import { Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { baseEX, exchanges } from "./fundingComparison.script";

const CDN_PREFIX = "https://oss.orderly.network/static/exchange_logo";

export const useFundingColumns = () => {
  const { t } = useTranslation();
  const { isMobile } = useScreen();

  return useMemo<Column[]>(() => {
    return [
      {
        title: t("markets.column.market"),
        dataIndex: "symbol",
        width: 150,
        onSort: true,
        className: isMobile ? "oui-pl-0" : undefined,
        render: (value) => (
          <Flex gapX={1}>
            <TokenIcon
              symbol={value}
              className={isMobile ? "oui-size-[18px]" : "oui-size-5"}
            />

            <Text.formatted
              rule="symbol"
              formatString="base-type"
              size="xs"
              weight="semibold"
            >
              {value}
            </Text.formatted>
          </Flex>
        ),
      },
      ...exchanges.map<Column>((item) => ({
        title: (
          <Flex justify="start" itemAlign="center" gap={1}>
            {!item.includes(" - ") && (
              <img
                src={`${CDN_PREFIX}/${item.toLowerCase().replace(" ", "_")}.png`}
                className={cn(
                  "oui-size-6 oui-rounded-full oui-object-cover",
                  isMobile ? "oui-size-[18px]" : "oui-size-6",
                )}
              />
            )}
            {item}
          </Flex>
        ),
        dataIndex: item,
        onSort: true,
        width: item.includes(" - ") ? 160 : 130,
        render(value: number | null) {
          if (value === null) {
            return "-";
          }

          return (
            <Text.numeral
              rule="percentages"
              dp={5}
              coloring={item.includes(" - ") || item === baseEX ? true : false}
              rm={Decimal.ROUND_DOWN}
              showIdentifier
            >
              {value}
            </Text.numeral>
          );
        },
      })),
    ];
  }, [t, isMobile]);
};
