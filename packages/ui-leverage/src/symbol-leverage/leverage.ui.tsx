import { useTranslation } from "@orderly.network/i18n";
import { TokenIcon, Text, Badge, Divider } from "@orderly.network/ui";
import { Leverage } from "../index";
import { SymbolLeverageScriptReturns } from "./leverage.script";

export const SymbolLeverageUI = (props: SymbolLeverageScriptReturns) => {
  const { t } = useTranslation();
  const isBuy = true;

  return (
    <div className="oui-flex oui-flex-col oui-gap-4">
      <Text size="base" weight="semibold" intensity={98}>
        Adjust Leverage
      </Text>
      <Divider className="-oui-mt-[6px] oui-mb-1" />
      <div className="oui-flex oui-items-center oui-gap-2">
        <TokenIcon symbol={props.symbol} className="oui-size-5" />
        <Text.formatted
          rule="symbol"
          formatString="base-type"
          size="base"
          weight="semibold"
          intensity={98}
        >
          {props.symbol}
        </Text.formatted>
        <div className="oui-ml-auto oui-flex oui-items-center oui-gap-1">
          <Badge color={isBuy ? "success" : "danger"} size="xs">
            {isBuy ? t("common.long") : t("common.short")}
          </Badge>
          {/* <LeverageBadge
            symbol={props.symbol || ""}
            leverage={props.currentLeverage}
          /> */}
        </div>
      </div>
      <Leverage {...props} />
    </div>
  );
};

// const LeverageDisplay = ({ symbol }: { symbol: string }) => {
//   const leverage = useSymbolLeverage(symbol);

//   return (
//     <Text.numeral dp={0} rm={Decimal.ROUND_DOWN} size="2xs" unit="X">
//       {leverage !== "-" ? leverage : "--"}
//     </Text.numeral>
//   );
// };
