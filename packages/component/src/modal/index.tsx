import { modalActions } from "./modalContext";
import { register, unregister } from "./modalHelper";
import { actionSheet } from "@/modal/preset/actionSheet";
import { confirm } from "./preset/confirm";

// @ebay/nice-modal-react
export { useModal } from "./useModal";

export const modal = {
  register,
  unregister,

  ...modalActions,
  actionSheet,
  confirm,
  /// toast
};
