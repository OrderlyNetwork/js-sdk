import { useSettingScript } from "./setting.script";
import { Setting } from "./setting.ui";

export const SettingWidget = (props: {
    pnlNotionalDecimalPrecision: any;
    setPnlNotionalDecimalPrecision: (value: number) => void;
    unPnlPriceBasis: any;
    setUnPnlPriceBasic: (value: string) => void;
    showAllSymbol: any;
    setShowAllSymbol: (value: boolean) => void;
  }) => {
  const state = useSettingScript(props);
  return <Setting {...state} />;
};
