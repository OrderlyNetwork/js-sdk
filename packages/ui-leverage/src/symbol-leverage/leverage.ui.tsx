import { useTranslation, Trans } from "@orderly.network/i18n";
import { TokenIcon, Text, Badge, Divider, Flex, cn } from "@orderly.network/ui";
import { LeverageHeader } from "../index";
import {
  LeverageInput,
  LeverageSelector,
  LeverageSlider,
  LeverageFooter,
} from "../leverage.ui";
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
      <Divider />
      <Flex itemAlign={"start"} direction={"column"} mb={0}>
        <LeverageHeader currentLeverage={props.currentLeverage} />
        <LeverageInput {...props} />
        <LeverageSelector {...props} />
        <LeverageSlider {...props} />
        <Divider className="oui-mb-3 oui-w-full" />
        <div className="oui-flex oui-flex-col oui-gap-1 oui-pb-4 oui-text-xs oui-font-normal oui-text-base-contrast-54">
          <div>
            <Trans
              i18nKey="leverage.maxPositionLeverage.tips"
              values={{ amount: props.maxPositionNotional }}
              // @ts-ignore
              components={[
                <Text.numeral
                  as="span"
                  key="0"
                  className="oui-text-base-contrast"
                  dp={0}
                />,
              ]}
            />
          </div>
          <div>
            <Trans
              i18nKey="leverage.maxAvailableLeverage.tips"
              values={{ leverage: props.maxPositionLeverage }}
              // @ts-ignore
              components={[
                <Text.numeral
                  dp={0}
                  suffix="X"
                  as="span"
                  key="0"
                  className="oui-text-base-contrast"
                />,
              ]}
            />
          </div>
        </div>
        <div
          className={cn([
            "-oui-mb-2",
            props.overRequiredMargin || props.overMaxPositionLeverage
              ? "oui-block oui-text-xs oui-font-normal"
              : "oui-hidden",
          ])}
        >
          {props.overRequiredMargin && (
            <div>
              <Text color="warning">
                {t("leverage.overRequiredMargin.tips")}
              </Text>
            </div>
          )}
          {props.overMaxPositionLeverage && (
            <div>
              <Text color="warning">
                <Trans
                  i18nKey="leverage.overMaxPositionLeverage.tips"
                  values={{ leverage: props.maxPositionLeverage }}
                  // @ts-ignore
                  components={[
                    <Text.numeral dp={0} suffix="X" as="span" key="0" />,
                  ]}
                />
              </Text>
            </div>
          )}
        </div>
        <LeverageFooter {...props} />
      </Flex>
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
