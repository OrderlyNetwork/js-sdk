import {
  APIKeyItem,
  useAccount,
  useAccountInfo,
  useApiKeyManager,
} from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";
import { toast } from "@orderly.network/ui";
import { useState } from "react";

export type GenerateKeyInfo = {
  key: string;
  screctKey: string;
  ip?: string;
  permissions?: string;
};

export type ApiManagerScriptReturns = {
  address?: string;
  uid?: string;
  onCreateApiKey?: () => void;
  onReadApiGuide?: () => void;
  showCreateDialog: boolean;
  hideCreateDialog?: () => void;
  /** ipRestriction: "192.168.1.1,192.168.1.2" scope: 'read' or 'read,trading' or 'trading' */
  doCreate: (ipRestriction?: string, scope?: string) => Promise<number>;
  showCreatedDialog: boolean;
  hideCreatedDialog?: () => void;
  onCopyApiKeyInfo: () => void;
  doConfirm: () => void;
  hideDeleteDialog?: () => void;
  doDelete: (item: APIKeyItem) => Promise<void>;
  doEdit: (item: APIKeyItem, ip?: string) => Promise<void>;
  canCreateApiKey: boolean;
  status: AccountStatusEnum;
  keys: APIKeyItem[];
  generateKey?: GenerateKeyInfo;
};

export const useApiManagerScript = (): ApiManagerScriptReturns => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCreatedDialog, setShowCreatedDialog] = useState(false);
  const [generateKey, setGenerateKey] = useState<GenerateKeyInfo | undefined>();
  const { data } = useAccountInfo();

  const { state, account } = useAccount();
  const canCreateApiKey = state.status === AccountStatusEnum.EnableTrading;

  const [
    keys,
    {
      generateOrderlyKey,
      setIPRestriction,
      removeOrderkyKey,
      refresh,
      isLoading,
      error,
    },
  ] = useApiKeyManager();

  const onCreateApiKey = () => {
    setShowCreateDialog(true);
  };
  const onReadApiGuide = () => {
    window.open(
      "https://orderly.network/docs/build-on-evm/evm-api/api-authentication",
      "_blank"
    );
  };

  const hideCreateDialog = () => {
    setShowCreateDialog(false);
  };

  const doCreate = async (
    ipRestriction?: string,
    scope?: string
  ): Promise<number> => {
    try {
      const createdSuccess = (res: any, ip?: string) => {
        const key = res.data.orderly_key;
        const secretKey = account?.keyStore?.getOrderlyKey()?.secretKey || "";
        hideCreateDialog();
        setGenerateKey({
          key: key,
          screctKey: secretKey,
          ip: ip,
          permissions: scope
            ?.split(",")
            ?.map((e) => capitalizeFirstChar(e))
            .join(","),
        });
        setShowCreatedDialog(true);
      };

      const generateKeyRes = await generateOrderlyKey(scope).then(
        (data) => data
      );
      if (generateKeyRes.success !== true) {
        return Promise.resolve(0);
      }

      toast.success("API key created");
      if ((ipRestriction?.length || 0) > 0) {
        const res = await setIPRestriction(
          generateKeyRes.orderly_key,
          ipRestriction!
        );
        if (res.success) {
          createdSuccess(generateKeyRes, ipRestriction);
        }
      } else {
        createdSuccess(generateKeyRes, undefined);
      }
    } catch (err) {}

    return Promise.resolve(0);
  };

  const hideCreatedDialog = () => {
    setShowCreatedDialog(false);
    refresh();
  };

  const onCopyApiKeyInfo = () => {
    navigator.clipboard.writeText(JSON.stringify(generateKey));
    toast.success("API info copied");
  };
  const doConfirm = () => {
    hideCreatedDialog();
  };

  const doDelete = (item: APIKeyItem): Promise<any> => {
    return new Promise(async (resolve) => {
      await removeOrderkyKey(item.orderly_key)
        .then(
          (data) => {
            if (data?.success) {
              toast.success("API key deleted");
            }
            resolve(1);
          },
          (reject) => {}
        )
        .catch((err) => {});
    });
  };

  const doEdit = async (item: APIKeyItem, ip?: string): Promise<void> => {
    if ((ip?.length || 0) === 0) return Promise.reject();

    const data = await setIPRestriction(item.orderly_key, ip!);
    if (data.success) {
      toast.success("API key updated");
      refresh();
      return Promise.resolve();
    } else {
      toast.error(data.message);
    }
    return Promise.reject();
  };

  return {
    address: account.address,
    uid: "111",
    onCreateApiKey,
    onReadApiGuide,
    showCreateDialog,
    hideCreateDialog,
    doCreate,
    showCreatedDialog,
    hideCreatedDialog,
    onCopyApiKeyInfo,
    doConfirm,
    doDelete,
    doEdit,
    canCreateApiKey,
    status: state.status,
    keys: (keys || []).filter((e) => e.tag === "manualCreated"),
    // keys: keys || [],
    generateKey,
  };
};

export function capitalizeFirstChar(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
