import React from "react";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { Box, Flex, Text, Tooltip } from "@kodiak-finance/orderly-ui";
import { Decimal } from "@kodiak-finance/orderly-utils";

// import type { CollateralRatioReturns } from "./collateralRatio.script";

const TooltipIcon = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement>
>((props, ref) => {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 12 12"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      focusable={false}
      ref={ref}
      {...props}
    >
      <path d="M5.999 1.007a5 5 0 1 0 0 10 5 5 0 0 0 0-10m0 2.5a.5.5 0 1 1 0 1 .5.5 0 0 1 0-1m0 1.5a.5.5 0 0 1 .5.5v2.5a.5.5 0 0 1-1 0v-2.5a.5.5 0 0 1 .5-.5" />
    </svg>
  );
});

const TooltipContent: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Box className="oui-w-72 oui-max-w-72">
      <Text size="2xs" intensity={80}>
        {t("portfolio.overview.column.collateralRatio.explain")}
      </Text>{" "}
      <a
        href="https://orderly.network/docs/introduction/trade-on-orderly/multi-collateral"
        target="_blank"
        rel="noreferrer"
        className={
          "oui-border-b oui-border-dashed oui-border-line-12 oui-text-2xs oui-text-primary"
        }
      >
        {t("tradingLeaderboard.learnMore")}
      </a>
    </Box>
  );
};

export const CollateralRatioUI: React.FC<{ value: number }> = (props) => {
  const { t } = useTranslation();
  const { value } = props;
  return (
    <Flex width="100%" itemAlign="center" justify="between">
      <Flex justify="start" itemAlign="center">
        <Text size="2xs" intensity={36}>
          {t("portfolio.overview.column.collateralRatio")}
        </Text>
        <Tooltip className="oui-p-2" content={<TooltipContent />}>
          <TooltipIcon className="oui-ml-[2px] oui-cursor-pointer oui-text-base-contrast-36" />
        </Tooltip>
      </Flex>
      <Text.numeral
        dp={2}
        rm={Decimal.ROUND_DOWN}
        coloring
        className="oui-font-semibold"
        rule="percentages"
      >
        {value}
      </Text.numeral>
    </Flex>
  );
};
