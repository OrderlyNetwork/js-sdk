import {
  FlagKeys,
  useFeatureFlag,
  useLocalStorage,
  useSymbolLeverage,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { OrderSide } from "@orderly.network/types";
import { cn, modal, Text, useScreen } from "@orderly.network/ui";
import {
  SymbolLeverageDialogId,
  SymbolLeverageSheetId,
} from "@orderly.network/ui-leverage";
import { Decimal } from "@orderly.network/utils";
import {
  MarginModeSwitchDialogId,
  MarginModeSwitchSheetId,
  type MarginMode,
} from "../../marginModeSwitch";

type LeverageBadgeProps = {
  symbol: string;
  side: OrderSide;
  symbolLeverage?: number;
};

export const LeverageBadge = (props: LeverageBadgeProps) => {
  const { symbol, side, symbolLeverage } = props;
  const { isMobile } = useScreen();
  const { t } = useTranslation();
  const { maxLeverage } = useSymbolLeverage(symbol);
  const { enabled } = useFeatureFlag(FlagKeys.IsolatedMargin);

  const curLeverage = symbolLeverage || maxLeverage;
  const [marginMode] = useLocalStorage<MarginMode>(
    `orderly.marginMode.${symbol}`,
    "cross",
  );

  const showLeverageModal = () => {
    const modalId = isMobile ? SymbolLeverageSheetId : SymbolLeverageDialogId;
    modal.show(modalId, {
      symbol,
      side,
      curLeverage,
    });
  };

  const showMarginModeModal = () => {
    if (!enabled) {
      return;
    }

    const modalId = isMobile
      ? MarginModeSwitchSheetId
      : MarginModeSwitchDialogId;
    modal.show(modalId, {
      symbol,
      currentMarginMode: marginMode,
    });
  };

  return (
    <div
      className={cn(
        "oui-flex oui-w-full oui-items-center oui-rounded-md oui-border oui-border-line-12 oui-bg-base-6",
        "oui-h-8",
        "oui-select-none",
      )}
      data-testid="oui-testid-orderEntry-margin-leverage"
    >
      <button
        type="button"
        className={cn(
          "oui-flex oui-flex-1 oui-items-center oui-justify-center oui-gap-x-1",
          "oui-px-3 oui-py-1.5",
          "oui-text-xs oui-font-semibold oui-text-base-contrast-54",
          "oui-cursor-pointer",
        )}
        data-testid="oui-testid-orderEntry-margin-mode"
        aria-label={t("marginMode.switchMarginMode")}
        onClick={showMarginModeModal}
      >
        <Text>
          {marginMode === "isolated"
            ? t("marginMode.isolated")
            : t("marginMode.cross")}
        </Text>
      </button>
      <div className="oui-h-5 oui-w-px oui-bg-line" aria-hidden="true" />
      <button
        type="button"
        className={cn(
          "oui-flex oui-flex-1 oui-items-center oui-justify-center oui-gap-x-1",
          "oui-px-3 oui-py-1.5",
          "oui-text-xs oui-font-semibold oui-text-base-contrast-54",
          "oui-cursor-pointer",
        )}
        aria-label="Adjust leverage"
        onClick={showLeverageModal}
        data-testid="oui-testid-orderEntry-leverage"
      >
        <Text.numeral
          dp={0}
          rm={Decimal.ROUND_DOWN}
          unit="x"
          unitClassName="oui-ml-0"
        >
          {curLeverage}
        </Text.numeral>
      </button>
    </div>
  );
};
