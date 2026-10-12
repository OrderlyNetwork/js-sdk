import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { PerpsPositionsPanel } from "@orderly.network/trading-common";
import { cn } from "@orderly.network/ui";
import {
  MobilePositionHistoryWidget,
  MobilePositionsWidget,
  PositionHistoryWidget,
} from "@orderly.network/ui-positions";
import type { PredictionAccountPanelState } from "../prediction.types";
import { PredictionHistoryTable } from "./history/predictionHistoryTable.widget";
import { HoldingsTable } from "./holdings/holdingsTable.widget";
import type { PredictionPerpsPanelProps } from "./perpsPanel.types";
import {
  MobilePredictionHistory,
  MobilePredictionPositions,
} from "./predictionMobileCards.ui";
import {
  useSharedProductDataPanelScript,
  type ProductDataType,
  type ProductType,
} from "./sharedProductDataPanel.script";
import { useScopedPredictionAccount } from "./useScopedPredictionAccount";

export type SharedProductDataPanelProps = PredictionPerpsPanelProps & {
  state: PredictionAccountPanelState;
  type: ProductDataType;
  /** The product shown when this panel first opens on a page. */
  initialProduct: ProductType;
  perpsSymbol?: string;
  predictionUnderlyingSymbol?: string;
  /** Content rendered before the Perps / Prediction control, such as account filters. */
  beforeProductSelector?: React.ReactNode;
  perpsPositionsContent?: React.ReactNode;
  perpsPositionHistoryContent?: React.ReactNode;
  onProductChange?: (product: ProductType) => void;
  mobile?: boolean;
};

/**
 * Lets either trading surface inspect Perps and Prediction data without
 * combining their different columns or filters into one table.
 */
export const SharedProductDataPanel: React.FC<SharedProductDataPanelProps> = ({
  state,
  type,
  initialProduct,
  perpsSymbol,
  predictionUnderlyingSymbol,
  beforeProductSelector,
  perpsPositionsContent,
  perpsPositionHistoryContent,
  onProductChange,
  mobile = false,
  onSymbolChange,
  sharePnLConfig,
  pnlNotionalDecimalPrecision,
}) => {
  const { t } = useTranslation();
  const scopedState = useScopedPredictionAccount(
    state,
    predictionUnderlyingSymbol,
  );
  const {
    product,
    selectProduct,
    perpsPositionCount,
    predictionPositionCount,
  } = useSharedProductDataPanelScript({
    initialProduct,
    predictionPositionCount: scopedState.positions.length,
    perpsSymbol,
    onProductChange,
  });

  const perpsProps = {
    onSymbolChange,
    sharePnLConfig,
    pnlNotionalDecimalPrecision,
  };

  const content =
    product === "prediction" ? (
      type === "positions" ? (
        mobile ? (
          <MobilePredictionPositions state={scopedState} />
        ) : (
          <HoldingsTable state={scopedState} />
        )
      ) : mobile ? (
        <MobilePredictionHistory
          state={scopedState}
          predictionUnderlyingSymbol={predictionUnderlyingSymbol}
        />
      ) : (
        <PredictionHistoryTable
          state={scopedState}
          predictionUnderlyingSymbol={predictionUnderlyingSymbol}
        />
      )
    ) : type === "positions" ? (
      (perpsPositionsContent ??
      (mobile ? (
        <MobilePositionsWidget {...perpsProps} symbol={perpsSymbol} />
      ) : (
        <PerpsPositionsPanel {...perpsProps} symbol={perpsSymbol} />
      )))
    ) : (
      (perpsPositionHistoryContent ??
      (mobile ? (
        <MobilePositionHistoryWidget
          {...perpsProps}
          symbol={perpsSymbol}
          productType="PERP"
        />
      ) : (
        <PositionHistoryWidget
          {...perpsProps}
          symbol={perpsSymbol}
          productType="PERP"
        />
      )))
    );

  return (
    <div
      className={cn(
        "oui-flex oui-min-h-0 oui-flex-col",
        mobile ? "oui-w-full" : "oui-h-full oui-overflow-hidden",
      )}
    >
      {beforeProductSelector}
      <div
        role="tablist"
        aria-label={t("common.positions")}
        className="oui-mt-2 oui-inline-flex oui-w-fit oui-gap-x-[6px]"
      >
        {(["perps", "prediction"] as const).map((item) => {
          const active = product === item;
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => selectProduct(item)}
              data-state={active ? "active" : "inactive"}
              className={cn(
                "oui-group oui-text-2xs oui-inline-flex oui-h-7 oui-items-center oui-justify-center oui-gap-x-1 !oui-rounded-md oui-bg-base-7 oui-px-3 oui-font-medium oui-text-base-contrast-36 oui-transition-all hover:oui-bg-base-5 hover:oui-text-base-contrast-54 data-[state=active]:oui-bg-base-5 data-[state=active]:oui-text-base-contrast",
              )}
            >
              {item === "perps"
                ? t("common.perps")
                : t("prediction.filter.predictions")}
              {type === "positions" &&
                ` (${item === "perps" ? perpsPositionCount : predictionPositionCount})`}
            </button>
          );
        })}
      </div>
      {/* Remaining height after the product switcher; tables scroll inside. */}
      <div
        className={cn(
          "oui-min-h-0 oui-flex-1",
          !mobile && "oui-overflow-hidden",
        )}
      >
        {content}
      </div>
    </div>
  );
};
