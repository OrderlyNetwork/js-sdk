import { useTranslation } from "@orderly.network/i18n";
import { OrderType } from "@orderly.network/types";
import { Flex, Text, textVariants } from "@orderly.network/ui";
import { FeesWidget } from "../fees";
import { SlippageUI } from "../slippage/slippage.ui";

export function AssetInfo(props: {
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
  const { canTrade } = props;
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
      <Flex justify={"between"}>
        <Text size={"2xs"}>{t("leverage.accountLeverage")}</Text>
        <Flex
          gapX={1}
          className={textVariants({
            size: "2xs",
            intensity: 80,
          })}
        >
          <Text.numeral unit={canTrade ? "x" : undefined}>
            {canTrade ? (props.currentLeverage ?? "--") : "--"}
          </Text.numeral>
          {props.estLeverage && (
            <>
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.505 4.997c0-.23.186-.416.416-.416H6.07L4.833 3.332l.586-.585 1.964 1.95a.42.42 0 0 1 .122.3.42.42 0 0 1-.122.3l-1.964 1.95-.586-.585L6.07 5.413H2.921a.416.416 0 0 1-.416-.416"
                  fill="#fff"
                  fillOpacity=".54"
                />
              </svg>

              <span>{`${props.estLeverage}x`}</span>
            </>
          )}
        </Flex>
        {/* <Text.numeral unit={"x"} size={"2xs"}>
          {props.estLeverage ?? "--"}
        </Text.numeral> */}
      </Flex>
      {props.orderType === OrderType.MARKET &&
        !props.disableFeatures?.includes("slippageSetting") && (
          <SlippageUI
            slippage={props.slippage}
            setSlippage={props.setSlippage}
            estSlippage={props.estSlippage}
          />
        )}

      {!props.disableFeatures?.includes("feesInfo") && <FeesWidget />}
    </div>
  );
}
