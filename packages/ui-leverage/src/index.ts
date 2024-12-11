import { registerSimpleDialog } from "@orderly.network/ui";
import { LeverageEditor } from "./leverage.widget";

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
  title: "Max account leverage",
  size: "md",
});
