import { FlagKeys, useFeatureFlag } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { OrderSide } from "@orderly.network/types";
import { MarginMode } from "@orderly.network/types";
import { cn, modal, Text, useScreen } from "@orderly.network/ui";
import {
  SymbolLeverageDialogId,
  SymbolLeverageSheetId,
} from "@orderly.network/ui-leverage";
import { Decimal } from "@orderly.network/utils";
import {
  MarginModeSwitchDialogId,
  MarginModeSwitchSheetId,
} from "../marginModeSwitch";

type LeverageBadgeProps = {
  symbol: string;
  side: OrderSide;
  symbolLeverage?: number;
  marginMode?: MarginMode;
  disabled?: boolean;
};

export const LeverageBadge = (props: LeverageBadgeProps) => {
  const { symbol, side, symbolLeverage, disabled } = props;
  const { isMobile } = useScreen();
  const { t } = useTranslation();
  const { enabled } = useFeatureFlag(FlagKeys.IsolatedMargin);

  const marginMode = props.marginMode;

  const isDisabled = !!disabled;

  const showLeverageModal = () => {
    if (isDisabled) return;

    const modalId = isMobile ? SymbolLeverageSheetId : SymbolLeverageDialogId;
    modal.show(modalId, {
      symbol,
      side,
      curLeverage: symbolLeverage,
      marginMode,
    });
  };

  const showMarginModeModal = () => {
    if (isDisabled || !enabled) {
      return;
    }

    const modalId = isMobile
      ? MarginModeSwitchSheetId
      : MarginModeSwitchDialogId;
    modal.show(modalId, {
      symbol,
    });
  };

  return (
    <div
      className={cn(
        "oui-flex oui-w-full oui-items-center oui-rounded-md oui-border oui-border-line-12 oui-bg-base-6",
        "oui-orderEntry-leverage-btn",
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
          isDisabled ? "oui-cursor-not-allowed" : "oui-cursor-pointer",
        )}
        data-testid="oui-testid-orderEntry-margin-mode"
        aria-label={t("marginMode.switchMarginMode")}
        disabled={isDisabled}
        onClick={showMarginModeModal}
      >
        <Text>
          {marginMode === undefined
            ? "--"
            : marginMode === MarginMode.ISOLATED
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
          isDisabled ? "oui-cursor-not-allowed" : "oui-cursor-pointer",
        )}
        aria-label="Adjust leverage"
        disabled={isDisabled}
        onClick={showLeverageModal}
        data-testid="oui-testid-orderEntry-leverage"
      >
        {symbolLeverage === undefined ? (
          <Text>--</Text>
        ) : (
          <Text.numeral
            dp={0}
            rm={Decimal.ROUND_DOWN}
            unit="x"
            unitClassName="oui-ml-0"
          >
            {symbolLeverage}
          </Text.numeral>
        )}
      </button>
    </div>
  );
};
