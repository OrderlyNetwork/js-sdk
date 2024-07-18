import { Setting } from "./setting.ui";
import { useSettingScript } from "./setting.script";


export const SettingWidget = () => {
  const state = useSettingScript();
  return <Setting {...state} />;
};
