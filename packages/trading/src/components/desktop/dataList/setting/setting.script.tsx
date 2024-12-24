import { SettingWidgetProps } from "./setting.widget";

export const useSettingScript = (props: SettingWidgetProps) => {
  return {
    ...props,
  };
};

export type SettingState = ReturnType<typeof useSettingScript>;
