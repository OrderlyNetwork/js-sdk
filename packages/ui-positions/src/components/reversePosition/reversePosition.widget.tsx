import React, { useMemo } from "react";
import { i18n } from "@orderly.network/i18n";
import { useTranslation } from "@orderly.network/i18n";
import { API } from "@orderly.network/types";
import {
  registerSimpleDialog,
  SimpleDialog,
  useModal,
} from "@orderly.network/ui";
import { useReversePositionScript } from "./reversePosition.script";
import { ReversePosition } from "./reversePosition.ui";

export type ReversePositionWidgetProps = {
  position: API.PositionExt | API.PositionTPSLExt;
  close?: () => void;
  resolve?: (value?: any) => void;
  reject?: (reason?: any) => void;
};

export const ReversePositionWidget: React.FC<ReversePositionWidgetProps> = (
  props,
) => {
  const { position, close, resolve, reject } = props;
  const { t } = useTranslation();
  const { visible, hide, onOpenChange } = useModal();

  const state = useReversePositionScript({
    position,
    onSuccess: () => {
      resolve?.(true);
      hide();
    },
    onError: (error: any) => {
      reject?.(error);
      hide();
    },
  });

  const actions = useMemo(() => {
    return {
      primary: {
        label: t("common.confirm"),
        onClick: async () => {
          try {
            const result = await state.reversePosition();
            if (result) {
              resolve?.(true);
              hide();
              return true;
            } else {
              reject?.(false);
              return false;
            }
          } catch (error) {
            reject?.(error);
            throw error;
          }
        },
        loading: state.isReversing,
        disabled: state.isReversing || !state.displayInfo,
      },
      secondary: {
        label: t("common.cancel"),
        onClick: async () => {
          reject?.("cancel");
          hide();
          return false;
        },
      },
    };
  }, [state, t, resolve, reject, hide]);

  // Create our own SimpleDialog to handle actions
  // Note: This will be wrapped by registerSimpleDialog's SimpleDialog
  // We need to override the wrapper's SimpleDialog behavior
  return (
    <SimpleDialog
      open={visible}
      onOpenChange={onOpenChange}
      size="sm"
      title={i18n.t("positions.reverse.title")}
      classNames={{
        content: "oui-border oui-border-line-6",
      }}
      actions={actions}
    >
      <ReversePosition {...state} />
    </SimpleDialog>
  );
};

export const ReversePositionDialogId = "ReversePositionDialogId";

registerSimpleDialog<ReversePositionWidgetProps>(
  ReversePositionDialogId,
  ReversePositionWidget,
  {
    size: "sm",
    classNames: {
      content: "oui-border oui-border-line-6",
    },
    title: () => i18n.t("positions.reverse.title"),
  },
);
