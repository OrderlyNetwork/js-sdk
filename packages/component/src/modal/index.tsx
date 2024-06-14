import { modalActions } from "./modalContext";
import { register, unregister } from "./modalHelper";

import { sheet } from "./preset/sheet";
import { alert } from "./preset/alert";
import { dialog } from "./preset/dialog";

import { confirm } from "./preset/confirm";
import { actionSheet } from "./preset/actionSheet";

export type { ModalHocProps } from "./types";

// @ebay/nice-modal-react
export { useModal } from "./useModal";

export type modalPersetName = "actionSheet" | "confirm" | "sheet";

export const modalPerset: Record<string, string> = {};

export const modal = {
  register,
  unregister,

  ...modalActions,
  actionSheet,
  confirm,
  alert,
  sheet,
  dialog,
  // alert
  //actionSheet
  /// toast
};
