import { useMemo, useRef } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { MenuItem } from "@orderly.network/ui";

export enum PnLMode {
  PnL = "PnL",
  OFFSET = "Offset",
  PERCENTAGE = "Offset%",
}

export type BuilderProps = { type: string };

export const usePNLInputBuilder = (props: BuilderProps) => {
  const { type } = props;
  const [mode, setMode] = useLocalStorage<PnLMode>(
    "TP/SL_Mode",
    PnLMode.PERCENTAGE
  );

  const key = useMemo(() => {
    switch (mode) {
      case PnLMode.OFFSET:
        return `${type.toLowerCase()}_offset`;
      case PnLMode.PERCENTAGE:
        return `${type.toLowerCase()}_offset_percentage`;
      default:
        return `${type.toLowerCase()}_pnl`;
    }
  }, [mode]);
  const modes = useMemo<MenuItem[]>(() => {
    return [
      { label: "PnL", value: PnLMode.PnL },
      { label: "Offset", value: PnLMode.OFFSET },
      { label: "Offset%", value: PnLMode.PERCENTAGE },
    ];
  }, []);

  const percentageSuffix = useRef<string>("");

  return {
    mode,
    modes,
    onModeChange: (mode: PnLMode) => {
      setMode(mode);
    },
  };
};

export type PNLInputState = ReturnType<typeof usePNLInputBuilder>;
