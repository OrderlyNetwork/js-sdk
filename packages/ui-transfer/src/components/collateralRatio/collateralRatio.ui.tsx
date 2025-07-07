import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Box, Flex, Text, Tooltip } from "@orderly.network/ui";

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
      <Text
        size="2xs"
        intensity={80}
        className="oui-cursor-pointer oui-border-b oui-border-dashed oui-border-line-12 oui-text-primary"
      >
        {t("tradingLeaderboard.learnMore")}
      </Text>
    </Box>
  );
};

export const CollateralRatioUI: React.FC<
  Readonly<{ collateralRatio: number }>
> = (props) => {
  const { t } = useTranslation();
  const { collateralRatio } = props;
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
      <Text size="2xs" className="oui-select-none" intensity={80}>
        {collateralRatio}%
      </Text>
    </Flex>
  );
};
