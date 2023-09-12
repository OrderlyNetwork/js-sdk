import { modalActions } from "./modalContext";
import { register, unregister } from "./modalHelper";
import { actionSheet } from "@/modal/preset/actionSheet";
import { confirm } from "./preset/confirm";
import { sheet } from "./preset/sheet";
import { alert } from "./preset/alert";

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
  // alert
  //actionSheet
  /// toast
};
