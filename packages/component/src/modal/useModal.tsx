import { FC, useCallback, useContext, useEffect } from "react";
import { ModalHandler } from "./types";
import {
  ModalContext,
  hideModalCallbacks,
  modalActions,
  modalCallbacks,
} from "./modalContext";
import { getModalId } from "./utils";
import { register } from "./modalHelper";

export function useModal(
  modal: string,
  args?: Record<string, unknown>
): ModalHandler;
export function useModal<T extends FC<any>>(modal: T, args?: any): ModalHandler;
export function useModal(modal?: any, args?: any): ModalHandler {
  const modals = useContext(ModalContext);

  let modalId: string | null;
  let isComponent = modal && typeof modal !== "string";

  if (!modal) {
    modalId = typeof modal === "string" ? modal : null;
  } else {
    modalId = getModalId(modal);
  }

  if (!modalId) {
    throw new Error("modalId is required");
  }

  const id = modalId as string;

  useEffect(() => {
    if (isComponent) {
      register(id, modal, args);
    }
  }, [isComponent, modalId, modal, args]);

  const modalInfo = modals[id];

  const show = useCallback(
    (args?: Record<string, unknown>) => modalActions.show(id, args),
    [id]
  );

  const hide = useCallback(() => modalActions.hide(id), [id]);

  const remove = useCallback(() => modalActions.remove(id), [id]);

  const resolve = useCallback(
    (args?: unknown) => {
      modalCallbacks[id]?.resolve(args);
      delete modalCallbacks[id];
    },
    [id]
  );

  const reject = useCallback(
    (args?: unknown) => {
      modalCallbacks[id]?.reject(args);
      delete modalCallbacks[id];
    },
    [id]
  );

  const resolveHide = useCallback((args?: unknown) => {
    hideModalCallbacks[id]?.resolve(args);
    delete hideModalCallbacks[id];
  }, []);

  return {
    id,
    args: modalInfo?.args,
    visible: !!modalInfo?.visible,
    keepMounted: !!modalInfo?.keepMounted,

    show,
    hide,
    remove,
    resolve,
    reject,
    resolveHide,
  };
}
