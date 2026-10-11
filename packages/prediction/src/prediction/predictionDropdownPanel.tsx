import React, { useCallback, useEffect, useRef } from "react";
import type { PredictionMarketPanelProps } from "./predictionMarketPanel.ui";
import { PredictionMarketPanelWidget } from "./predictionMarketPanel.ui";

type PredictionDropdownPanelProps = Omit<
  PredictionMarketPanelProps,
  "bbos" | "onSelect"
> & {
  hide: () => void;
  onPredictionSelect?: (symbol: string) => void;
};

// The dropdown host hands `renderTabContent` a fresh `hide` on every render;
// the latest-ref keeps `onSelect` identity stable so memoized market rows
// skip re-rendering on page ticks, while selection still closes the dropdown
// with the current handle.
export const PredictionDropdownPanel: React.FC<
  PredictionDropdownPanelProps
> = ({ hide, onPredictionSelect, ...panelProps }) => {
  const hideRef = useRef(hide);
  useEffect(() => {
    hideRef.current = hide;
  });
  const onSelect = useCallback(
    (symbol: string) => {
      hideRef.current();
      onPredictionSelect?.(symbol);
    },
    [onPredictionSelect],
  );
  return (
    <PredictionMarketPanelWidget
      {...panelProps}
      onSelect={onPredictionSelect ? onSelect : undefined}
    />
  );
};
