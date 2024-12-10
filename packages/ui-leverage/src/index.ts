import { registerSimpleDialog } from "@orderly.network/ui";
import { LeverageEditor } from "./leverage.widget";

const LeverageWidgetId = "leverageEditor";

export { LeverageEditor } from "./leverage.widget";
export { Leverage } from "./leverage.ui";

registerSimpleDialog(LeverageWidgetId, LeverageEditor, {
  title: "Max account leverage",
  size: "md",
});

export { LeverageWidgetId };

export { LeverageSlider } from "./leverage.ui";
