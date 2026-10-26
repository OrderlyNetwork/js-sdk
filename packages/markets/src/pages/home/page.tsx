import React, { useCallback } from "react";
import {
  MarketsHomePage as MarketsHomePageBase,
  type MarketsHomePageProps as MarketsHomePageBaseProps,
  type MarketTabContentRenderer,
} from "@orderly.network/markets-core";
import { usePredictionMarketsExtension } from "@orderly.network/prediction";
import { useAppContext, useFeatureEnabled } from "@orderly.network/react-app";
import { predictionRoute } from "@orderly.network/types";

export type MarketsHomePageProps = MarketsHomePageBaseProps & {
  /** Override application navigation; receives the exact round symbol. */
  onPredictionSelect?: (symbol: string) => void;
};

export const MarketsHomePage: React.FC<MarketsHomePageProps> = (props) => {
  const { onRouteChange } = useAppContext();
  const predictionEnabled = useFeatureEnabled("prediction");
  const defaultPredictionSelect = useCallback(
    (symbol: string) => {
      onRouteChange?.(predictionRoute(symbol));
    },
    [onRouteChange],
  );
  const hasPredictionNavigation = !!(props.onPredictionSelect || onRouteChange);
  const enabled = predictionEnabled && hasPredictionNavigation;
  const prediction = usePredictionMarketsExtension(
    "marketsDataList",
    props.onPredictionSelect ?? defaultPredictionSelect,
    { enabled: hasPredictionNavigation },
  );
  const renderTabContent = useCallback<MarketTabContentRenderer>(
    (tab, key, hide) => {
      const custom = props.renderTabContent?.(tab, key, hide);
      return custom !== undefined
        ? custom
        : enabled
          ? prediction.renderTabContent(tab, key, hide)
          : undefined;
    },
    [props.renderTabContent, enabled, prediction.renderTabContent],
  );

  return (
    <MarketsHomePageBase
      {...props}
      tabs={props.tabs ?? (enabled ? prediction.tabs : undefined)}
      renderTabContent={renderTabContent}
      renderTabAfterContent={
        props.renderTabAfterContent ??
        (enabled ? prediction.renderTabAfterContent : undefined)
      }
    />
  );
};
