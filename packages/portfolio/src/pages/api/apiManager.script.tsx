import {
  APIKeyItem,
  OrderlyContext,
  ScopeType,
  useAccount,
  useAccountInfo,
  useApiKeyManager,
  useQuery,
} from "@orderly.network/hooks";
import { useAppContext, useDataTap } from "@orderly.network/react-app";
import { AccountStatusEnum } from "@orderly.network/types";
import { toast } from "@orderly.network/ui";
import { useContext, useState } from "react";

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
  doCreate: (ipRestriction?: string, scope?: ScopeType) => Promise<number>;
  showCreatedDialog: boolean;
  hideCreatedDialog?: () => void;
  onCopyApiKeyInfo: () => void;
  doConfirm: () => void;
  hideDeleteDialog?: () => void;
  doDelete: (item: APIKeyItem) => Promise<void>;
  doEdit: (item: APIKeyItem, ip?: string) => Promise<void>;
  canCreateApiKey: boolean;
  wrongNetwork: boolean;
  status: AccountStatusEnum;
  keys: APIKeyItem[];
  generateKey?: GenerateKeyInfo;
  onCopyAccountId: () => void;
  onCopyApiKey: (key?: string) => void;
  onCopyApiSecretKey: () => void;
  onCopyIP: () => void;
  verifyIP: (ip: string) => string;
};

export const useApiManagerScript = (): ApiManagerScriptReturns => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCreatedDialog, setShowCreatedDialog] = useState(false);
  const [generateKey, setGenerateKey] = useState<GenerateKeyInfo | undefined>();
  const { configStore } = useContext(OrderlyContext);
  const brokerId = configStore.get("brokerId");
  const { wrongNetwork } = useAppContext();

  const { state, account } = useAccount();
  const canCreateApiKey = state.status === AccountStatusEnum.EnableTrading;
  const { data } = useQuery<
    | undefined
    | {
        user_id: number;
        account_id: string;
      }
  >(`/v1/get_account?address=${account.address}&broker_id=${brokerId}`);

  const [
    keys,
    {
      generateOrderlyKey,
      setIPRestriction,
      removeOrderkyKey,
      resetOrderlyKeyIPRestriction,
      refresh,
      isLoading,
      error,
    },
  ] = useApiKeyManager({
    keyInfo: { keyStatus: "ACTIVE" },
  });

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
    scope?: ScopeType
  ): Promise<number> => {
    try {
      const createdSuccess = (
        res: {
          key: string;
          secretKey: string;
        },
        ip?: string
      ) => {
        const { key, secretKey } = res;
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

      const generateKeyRes = await generateOrderlyKey(scope);

      toast.success("API key created");
      console.log("xxx generateKeyRes", generateKeyRes);
      
      if ((ipRestriction?.length || 0) > 0) {
        const key = generateKeyRes.key.startsWith("ed25519:") ? generateKeyRes.key : `ed25519:${generateKeyRes.key}`;
        const res = await setIPRestriction(key, ipRestriction!);
        console.log("set ip res", res);
        if (res.success) {
          createdSuccess(generateKeyRes, res.data.ip_restriction_list);
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
          async (data) => {
            if (data?.success) {
              toast.success("API key deleted");
              refresh();
              // delete current api key, wiil disconnect
              const curKey = await account.keyStore
                .getOrderlyKey()
                ?.getPublicKey();
              if (item.orderly_key === curKey) {
                account.destoryOrderlyKey();
              }
            }
            resolve(1);
          },
          (reject) => {}
        )
        .catch((err) => {});
    });
  };

  const doEdit = async (item: APIKeyItem, ip?: string): Promise<void> => {
    let future;
    if ((ip?.length || 0) === 0) {
     future = resetOrderlyKeyIPRestriction(item.orderly_key, "ALLOW_ALL_IPS");
    } else {
      future = setIPRestriction(item.orderly_key, ip!);
    }

    const data = await future;
  
    if (data.success) {
      toast.success("API key updated");
      refresh();
      return Promise.resolve();
    } else {
      toast.error(data.message);
    }
    return Promise.reject();
  };

  const onCopyAccountId = () => toast.success("Account id copied");
  const onCopyApiKey = (key?: string) => {
    if (typeof key !== 'undefined') {
      navigator.clipboard.writeText(key.replace("ed25519:", ""));
    }
    toast.success("API key copied");
  };
  const onCopyApiSecretKey = () => toast.success("Secret key copied");
  const onCopyIP = () => toast.success("Restricted IP copied");

  let keyList = (keys || []).filter(
    (e) => e.tag === "manualCreated" && e.key_status === "ACTIVE"
  );
  keyList = useDataTap(keyList) || [];

  const verifyIP = (ip: string) => {
    const ipRegex = /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(,((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9]))*$/;
    return ipRegex.test(ip) ? '' : 'IP restriction format is incorrect.';
  };

  return {
    address: data?.account_id,
    uid: `${data?.user_id || "--"}`,
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
    keys: keyList,
    generateKey,
    onCopyAccountId,
    wrongNetwork,
    onCopyApiKey,
    onCopyApiSecretKey,
    onCopyIP,
    verifyIP,
  };
};

export function capitalizeFirstChar(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
