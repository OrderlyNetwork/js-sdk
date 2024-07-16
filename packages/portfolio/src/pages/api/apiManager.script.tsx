import { useAccount } from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";
import { modal } from "@orderly.network/ui";
import { useState } from "react";

export type ApiManagerScriptReturns = {
  address?: string;
  uid?: number;
  onCreateApiKey?: () => void;
  onReadApiGuide?: () => void;
  showCreateDialog: boolean;
  hideCreateDialog?: () => void;
  doCreate: () => Promise<void>;
  showCreatedDialog: boolean;
  hideCreatedDialog?: () => void;
  onCopyApiKeyInfo: () => void;
  doConfirm: () => void;
  showDeleteDialog: boolean;
  hideDeleteDialog?: () => void;
  doDelete: () => void;
  showEditDialog: boolean;
  hideEditDialog?: () => void;
  doEdit: () => Promise<void>;
  canCreateApiKey: boolean;
  status: AccountStatusEnum;
};

export const useApiManagerScript = (): ApiManagerScriptReturns => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCreatedDialog, setShowCreatdeDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { state } = useAccount();
  const canCreateApiKey = state.status === AccountStatusEnum.EnableTrading;

  const onCreateApiKey = () => {
    setShowCreateDialog(true);
  };
  const onReadApiGuide = () => {};

  const hideCreateDialog = () => {
    setShowCreateDialog(false);
  };

  const doCreate = async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  };

  const hideCreatedDialog = () => {
    setShowCreatdeDialog(false);
  };

  const onCopyApiKeyInfo = () => {};
  const doConfirm = () => {};

  const hideDeleteDialog = () => {
    setShowDeleteDialog(false);
  };
  const doDelete = () => {};

  const hideEditDialog = () => {
    setShowEditDialog(false);
  };

  const doEdit = (): Promise<void> => {

    return Promise.resolve();
  };

  return {
    address: "0xe8f299b9555c6de49fd9b06637cd89781901111f",
    uid: 106732112,
    onCreateApiKey,
    onReadApiGuide,
    showCreateDialog,
    hideCreateDialog,
    doCreate,
    showCreatedDialog,
    hideCreatedDialog,
    onCopyApiKeyInfo,
    doConfirm,
    showDeleteDialog,
    hideDeleteDialog,
    doDelete,
    showEditDialog,
    hideEditDialog,
    doEdit,
    canCreateApiKey,
    status: state.status,
  };
};
