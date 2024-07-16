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
};

export const useApiManagerScript = (): ApiManagerScriptReturns => {
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    const onCreateApiKey = () => {
        setShowCreateDialog(true);
    };
    const onReadApiGuide = () => {};

    const hideCreateDialog = () => {
        setShowCreateDialog(false);
    };

    const doCreate = async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
              resolve(1);
            }, 2000);
          });
    };
    return {
        address: "0xe8f299b9555c6de49fd9b06637cd89781901111f",
        uid: 106732112,
        onCreateApiKey,
        onReadApiGuide,
        showCreateDialog,
        hideCreateDialog,
        doCreate,
    };
};