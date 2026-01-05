import React from "react";
import { i18n } from "@orderly.network/i18n";
import {
  modal,
  registerSimpleDialog,
  registerSimpleSheet,
  toast,
  useModal,
} from "@orderly.network/ui";
import {
  MarginModeSettingsDialogId,
  MarginModeSettingsSheetId,
} from "../marginModeSettings";
import {
  useMarginModeSwitchScript,
  type MarginMode,
  type MarginModeSwitchScriptOptions,
} from "./marginModeSwitch.script";
import {
  MarginModeSwitch,
  type MarginModeSwitchProps,
} from "./marginModeSwitch.ui";

export type MarginModeSwitchWidgetProps = Pick<
  MarginModeSwitchProps,
  "onOpenSettings"
> &
  MarginModeSwitchScriptOptions;

export const MarginModeSwitchWidget: React.FC<MarginModeSwitchWidgetProps> = (
  props,
) => {
  const state = useMarginModeSwitchScript(props);
  const { id: currentModalId } = useModal();

  const onOpenSettings = () => {
    const modalId =
      currentModalId === MarginModeSwitchSheetId
        ? MarginModeSettingsSheetId
        : MarginModeSettingsDialogId;
    modal.show(modalId, {});
  };

  const onSelect = async (mode: MarginMode) => {
    if (mode === state.currentMarginMode) {
      state.close?.();
      return;
    }

    const res = await state.applyMarginMode(mode);
    if (res.success) {
      toast.success(i18n.t("marginMode.updatedSuccessfully"));
      state.close?.();
    }
  };

  return (
    <MarginModeSwitch
      symbol={state.symbol}
      isMobile={state.isMobile}
      currentMarginMode={state.currentMarginMode}
      selectedMarginMode={state.selectedMarginMode}
      close={state.close}
      onSelect={onSelect}
      onOpenSettings={props.onOpenSettings ?? onOpenSettings}
    />
  );
};

export const MarginModeSwitchSheetId = "MarginModeSwitchSheetId";
export const MarginModeSwitchDialogId = "MarginModeSwitchDialogId";

registerSimpleSheet(MarginModeSwitchSheetId, MarginModeSwitchWidget, {
  // Use custom header in widget UI for both web and mweb.
  title: undefined,
  closable: false,
  classNames: {
    content: "oui-bg-transparent !oui-px-0",
    body: "oui-p-0",
  },
});

registerSimpleDialog(MarginModeSwitchDialogId, MarginModeSwitchWidget, {
  // Use custom header in widget UI for both web and mweb.
  title: undefined,
  closable: false,
  classNames: {
    content: "oui-w-[360px] oui-bg-transparent !oui-px-0",
    body: "oui-p-0",
  },
});
