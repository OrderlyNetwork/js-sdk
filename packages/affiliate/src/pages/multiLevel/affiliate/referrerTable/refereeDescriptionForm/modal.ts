import { registerSimpleDialog } from "@orderly.network/ui";
import { RefereeDescriptionFormWidget } from "./refereeDescriptionForm.widget";

export const RefereeDescriptionFormDialogId = "RefereeDescriptionFormDialogId";

registerSimpleDialog(
  RefereeDescriptionFormDialogId,
  RefereeDescriptionFormWidget,
  {
    size: "sm",
    classNames: {
      content:
        "oui-border oui-border-line-6 oui-bg-[#1d1a26] !oui-max-w-[360px] !oui-px-0 oui-shadow-[0_12px_20px_rgba(0,0,0,0.2)]",
      body: "!oui-py-0",
    },
  },
);
