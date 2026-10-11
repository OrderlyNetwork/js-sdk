import React, { useCallback } from "react";
import {
  MarketsHomePage as MarketsHomePageBase,
  type MarketsHomePageProps as MarketsHomePageBaseProps,
  type MarketTabContentRenderer,
} from "@orderly.network/markets-core";
import { usePredictionMarketsExtension } from "@orderly.network/prediction";
import { useAppContext } from "@orderly.network/react-app";

export type MarketsHomePageProps = MarketsHomePageBaseProps & {
  /** Enable built-in Prediction markets when navigation is available. Defaults to true. */
  predictionEnabled?: boolean;
  /** Override application navigation; receives the exact round symbol. */
  onPredictionSelect?: (symbol: string) => void;
};

export const MarketsHomePage: React.FC<MarketsHomePageProps> = (props) => {
  const { onRouteChange } = useAppContext();
  const defaultPredictionSelect = useCallback(
    (symbol: string) => {
      onRouteChange?.({
        href: `/prediction/${encodeURIComponent(symbol)}`,
        name: "prediction",
      });
    },
    [onRouteChange],
  );
  const enabled =
    (props.predictionEnabled ?? true) &&
    !!(props.onPredictionSelect || onRouteChange);
  const prediction = usePredictionMarketsExtension(
    "marketsDataList",
    props.onPredictionSelect ?? defaultPredictionSelect,
    { enabled },
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
