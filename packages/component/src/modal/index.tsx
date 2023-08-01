import { modalActions } from "./modalContext";
import { register, unregister } from "./modalHelper";

// @ebay/nice-modal-react
export { useModal } from "./useModal";

export const modal = {
  register,
  unregister,

  ...modalActions,
};
