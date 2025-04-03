import {
  createContext,
  PropsWithChildren,
  ReactNode,
  useContext,
  useMemo,
} from "react";
import { PNL_Values, PnLMode } from "./useBuilder.script";
import { useLocalStorage } from "@orderly.network/hooks";
import { cn, Flex, Text } from "@orderly.network/ui";
import { useTranslation } from "@orderly.network/i18n";

type TipType = "ROI" | "PnL" | "Error";

export type PnlInputContextState = {
  mode: PnLMode;
  setMode: (mode: PnLMode) => void;
  tipsEle: ReactNode | null;
};

export const PnlInputContext = createContext<PnlInputContextState>(
  {} as PnlInputContextState
);

export const usePnlInputContext = () => {
  return useContext(PnlInputContext);
};

export const PnlInputProvider = (
  props: PropsWithChildren<{
    values: PNL_Values & {
      trigger_price?: string;
    };
    type: "TP" | "SL";
  }>
) => {
  const { type, values } = props;
  const [mode, setMode] = useLocalStorage<PnLMode>(
    "TP/SL_Mode",
    PnLMode.PERCENTAGE
  );
  const { t } = useTranslation();

  const tipsEle = useMemo(() => {
    if (!values.PnL || !props.values.trigger_price) return null;
    
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
              "oui-text-xs oui-ml-1",
              type === "TP" ? "oui-text-trade-profit" : "oui-text-trade-loss"
            )}
          >
            {values.ROI}
          </Text.numeral>
        ) : (
          <Text.numeral
            rule={"price"}
            className={cn(
              "oui-text-xs oui-ml-1",
              type === "TP" ? "oui-text-trade-profit" : "oui-text-trade-loss"
            )}
          >
            {values.PnL}
          </Text.numeral>
        )}
      </Flex>
    );
  }, [mode, props.values.PnL, props.values.trigger_price]);

  return (
    <PnlInputContext.Provider
      value={{
        mode,
        setMode,
        tipsEle,
      }}
    >
      {props.children}
    </PnlInputContext.Provider>
  );
};
