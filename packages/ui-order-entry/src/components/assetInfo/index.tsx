import { useTranslation } from "@veltodefi/i18n";
import { OrderType } from "@veltodefi/types";
import { Flex, Text, textVariants } from "@veltodefi/ui";
import { FeesWidget } from "../fee";
import { SlippageUI } from "../slippage/slippage.ui";

export function AssetInfo(props: {
  symbol: string;
  canTrade: boolean;
  quote: string;
  estLiqPrice: number | null;
  estLeverage: number | null;
  currentLeverage: number | null;
  slippage: string;
  dp: number;
  estSlippage: number | null;
  setSlippage: (slippage: string) => void;
  orderType: OrderType;
  disableFeatures?: ("slippageSetting" | "feesInfo")[];
}) {
  const { canTrade, disableFeatures, orderType, symbol } = props;
  const { t } = useTranslation();

  return (
    <div className={"oui-space-y-[2px] xl:oui-space-y-1"}>
      <Flex justify={"between"}>
        <Text size={"2xs"}>{t("orderEntry.estLiqPrice")}</Text>
        <Text.numeral
          unit={props.quote}
          size={"2xs"}
          dp={props.dp}
          className={"oui-text-base-contrast-80"}
          unitClassName={"oui-ml-1 oui-text-base-contrast-36"}
        >
          {canTrade ? (props.estLiqPrice ?? "--") : "--"}
        </Text.numeral>
      </Flex>

      {orderType === OrderType.MARKET &&
        !disableFeatures?.includes("slippageSetting") && (
          <SlippageUI
            slippage={props.slippage}
            setSlippage={props.setSlippage}
            estSlippage={props.estSlippage}
          />
        )}

      {!disableFeatures?.includes("feesInfo") && (
        <FeesWidget symbol={props.symbol} />
      )}
    </div>
  );
}
