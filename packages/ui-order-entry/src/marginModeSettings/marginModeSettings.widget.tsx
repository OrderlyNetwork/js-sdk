import React from "react";
import {
  toast,
  registerSimpleDialog,
  registerSimpleSheet,
} from "@orderly.network/ui";
import {
  useMarginModeSettingsScript,
  type MarginModeSettingsScriptOptions,
} from "./marginModeSettings.script";
import {
  MarginModeSettings,
  type MarginModeSettingsProps,
} from "./marginModeSettings.ui";

export type MarginModeSettingsWidgetProps = MarginModeSettingsScriptOptions;

export const MarginModeSettingsWidget: React.FC<
  MarginModeSettingsWidgetProps
> = (props) => {
  const state = useMarginModeSettingsScript(props);

  const handleSetMarginMode: MarginModeSettingsProps["onSetMarginMode"] =
    async (mode) => {
      if (state.selectedKeys.size === 0) return;

      await state.onSetMarginMode(mode);
      toast.success("Updated successfully");
      // Static version keeps the modal open for easier UI testing.
    };

  return (
    <MarginModeSettings {...state} onSetMarginMode={handleSetMarginMode} />
  );
};

export const MarginModeSettingsSheetId = "MarginModeSettingsSheetId";
export const MarginModeSettingsDialogId = "MarginModeSettingsDialogId";

registerSimpleSheet(MarginModeSettingsSheetId, MarginModeSettingsWidget, {
  title: undefined,
  closable: false,
  classNames: {
    content:
      "oui-bg-transparent !oui-px-0 !oui-py-0 oui-top-[100px] oui-bottom-0",
    // SheetBody must be full height, otherwise child `h-full`/flex layout can't allocate space
    // and footer may be pushed out of viewport.
    body: "oui-p-0 oui-h-full",
    overlay: "!oui-bg-black/10",
  },
});

registerSimpleDialog(MarginModeSettingsDialogId, MarginModeSettingsWidget, {
  title: undefined,
  closable: false,
  classNames: {
    content: "oui-w-[360px] oui-bg-transparent !oui-px-0",
    body: "oui-p-0",
    overlay: "!oui-bg-black/10",
  },
});
