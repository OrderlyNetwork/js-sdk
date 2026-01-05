import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Flex, Statistic } from "@orderly.network/ui";

export interface InfosProps {
  currentMargin: number;
  liquidationPrice: number;
  effectiveLeverage: number;
}

export const Infos: FC<InfosProps> = ({
  currentMargin,
  liquidationPrice,
  effectiveLeverage,
}) => {
  const { t } = useTranslation();

  return (
    <Flex
      direction="column"
      gap={1}
      className="oui-w-full oui-rounded-[6px] oui-bg-base-6 oui-p-3 oui-text-2xs oui-font-semibold"
    >
      <Statistic
        label={t("positions.adjustMargin.currentMargin")}
        valueProps={{ dp: 2, unit: " USDC", padding: false }}
        classNames={{
          root: "oui-flex-row oui-justify-between oui-items-center oui-w-full oui-text-2xs oui-h-5",
          label: "oui-text-2xs",
        }}
      >
        {currentMargin}
      </Statistic>
      <Statistic
        label={t("positions.adjustMargin.liqPriceAfter")}
        valueProps={{ dp: 2, unit: " USDC", padding: false }}
        classNames={{
          root: "oui-flex-row oui-justify-between oui-items-center oui-w-full oui-text-2xs oui-h-5",
          label: "oui-text-2xs",
        }}
      >
        {liquidationPrice ?? "--"}
      </Statistic>
      <Statistic
        label={t("positions.adjustMargin.leverageAfter")}
        valueProps={{ dp: 0, unit: " x" }}
        classNames={{
          root: "oui-flex-row oui-justify-between oui-items-center oui-w-full oui-text-2xs oui-h-5",
          label: "oui-text-2xs",
        }}
      >
        {effectiveLeverage ?? "--"}
      </Statistic>
    </Flex>
  );
};
