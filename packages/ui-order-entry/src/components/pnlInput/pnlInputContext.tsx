import React, { createContext, ReactNode, useContext, useMemo } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { cn, Flex, Text } from "@orderly.network/ui";
import { PNL_Values, PnLMode } from "./useBuilder.script";

type TipType = "ROI" | "PnL" | "Error";

export type PnlInputContextState = {
  mode: PnLMode;
  setMode: (mode: PnLMode) => void;
  tipsEle: ReactNode | null;
};

export const PnlInputContext = createContext<PnlInputContextState>(
  {} as PnlInputContextState,
);

export const usePnlInputContext = () => {
  return useContext(PnlInputContext);
};

export const PnlInputProvider: React.FC<
  React.PropsWithChildren<{
    values: PNL_Values & { trigger_price?: string };
    type: "TP" | "SL";
  }>
> = (props) => {
  const { type, values, children } = props;
  const [mode, setMode] = useLocalStorage<PnLMode>(
    "TP/SL_Mode",
    PnLMode.PERCENTAGE,
  );
  const { t } = useTranslation();

  const tipsEle = useMemo(() => {
    if (!values.PnL || !values.trigger_price) {
      return null;
    }
    return (
      <Flex>
        <span className={"oui-text-xs oui-text-base-contrast-54"}>
          {mode === PnLMode.PnL
            ? t("orderEntry.estRoi")
            : t("orderEntry.estPnL")}
        </span>
        {mode === PnLMode.PnL ? (
          <Text.numeral
            rule={"percentages"}
            className={cn(
              "oui-ml-1 oui-text-xs",
              type === "TP" ? "oui-text-trade-profit" : "oui-text-trade-loss",
            )}
          >
            {values.ROI}
          </Text.numeral>
        ) : (
          <Text.numeral
            rule={"price"}
            className={cn(
              "oui-ml-1 oui-text-xs",
              type === "TP" ? "oui-text-trade-profit" : "oui-text-trade-loss",
            )}
          >
            {values.PnL}
          </Text.numeral>
        )}
      </Flex>
    );
  }, [mode, values.ROI, values.PnL, values.trigger_price]);

  const memoizedValue = useMemo<PnlInputContextState>(() => {
    return { mode, setMode, tipsEle };
  }, [mode, setMode, tipsEle]);

  return (
    <PnlInputContext.Provider value={memoizedValue}>
      {children}
    </PnlInputContext.Provider>
  );
};
