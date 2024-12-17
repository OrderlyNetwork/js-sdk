import { useSettingScript } from "./setting.script";
import { Setting } from "./setting.ui";

export type SettingWidgetProps = {
  pnlNotionalDecimalPrecision: any;
  setPnlNotionalDecimalPrecision: (value: number) => void;
  unPnlPriceBasis: any;
  setUnPnlPriceBasic: (value: string) => void;
  hideOtherSymbols: any;
  setHideOtherSymbols: (value: boolean) => void;
}

export const SettingWidget = (props: SettingWidgetProps) => {
  const state = useSettingScript(props);
  return <Setting {...state} />;
};
