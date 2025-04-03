import { registerSimpleDialog } from "@orderly.network/ui";
import { LeverageEditor } from "./leverage.widget";
import { i18n } from "@orderly.network/i18n";

export { LeverageEditor, type LeverageEditorProps } from "./leverage.widget";
export { Leverage, LeverageSlider, LeverageHeader } from "./leverage.ui";
export type {
  LeverageProps,
  LeverageSliderProps,
  LeverageHeaderProps,
} from "./leverage.ui";
export {
  useLeverageScript,
  type LeverageScriptReturns,
} from "./leverage.script";

export const LeverageWidgetId = "leverageEditor";

registerSimpleDialog(LeverageWidgetId, LeverageEditor, {
  title: () => i18n.t("leverage.maxAccountLeverage"),
  size: "md",
});
