import React from "react";
import {
  toast,
  registerSimpleDialog,
  registerSimpleSheet,
} from "@orderly.network/ui";
import {
  useMarginModeSettingsScript,
  type MarginMode,
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
    content: "oui-h-full",
    body: "oui-p-0",
  },
});

registerSimpleDialog(MarginModeSettingsDialogId, MarginModeSettingsWidget, {
  title: undefined,
  closable: false,
  classNames: {
    content: "oui-w-[420px] oui-bg-transparent oui-p-0",
    body: "oui-p-0",
  },
});
