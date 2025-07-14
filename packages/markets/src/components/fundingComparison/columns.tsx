import { useCallback, useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { cn, Flex, TokenIcon, useScreen } from "@orderly.network/ui";
import type { Column } from "@orderly.network/ui";
import { Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { OrderlyIcon } from "../../icons";
import { useEXchanges } from "./useEXchanges";

const CDN_PREFIX = "https://oss.orderly.network/static/exchange_logo";

export const useFundingColumns = () => {
  const { t } = useTranslation();
  const { isMobile } = useScreen();
  const { exchanges, brokerName, brokerIconSrc } = useEXchanges();
  const getImgSrc = useCallback(
    (val: string) => {
      if (val === brokerName) {
        return brokerIconSrc;
      }
      return `${CDN_PREFIX}/${val.toLowerCase().replace(" ", "_")}.png`;
    },
    [brokerName, brokerIconSrc],
  );
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
      {
        title: (
          <Flex gapX={1}>
            <OrderlyIcon /> {t("markets.openInterest")}
          </Flex>
        ),
        dataIndex: "openInterest",
        width: 120,
        // align: "right",
        onSort: true,
        render: (value) => {
          if (value === "-") {
            return "-";
          }
          return (
            <Text.numeral currency="$" dp={0} rm={Decimal.ROUND_DOWN}>
              {value}
            </Text.numeral>
          );
        },
      },
      ...exchanges.map<Column>((item) => {
        const imgSrc = getImgSrc(item);
        return {
          title: (
            <Flex justify="start" itemAlign="center" gap={1}>
              {!item.includes(" - ") && imgSrc && (
                <img
                  src={imgSrc}
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
                coloring={item.includes(" - ") || item === brokerName}
                rm={Decimal.ROUND_DOWN}
                showIdentifier
              >
                {value}
              </Text.numeral>
            );
          },
        };
      }),
    ];
  }, [t, isMobile, exchanges, brokerName, getImgSrc]);
};
