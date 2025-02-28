import {
  APIKeyItem,
  OrderlyContext,
  ScopeType,
  useAccount,
  useApiKeyManager,
  useQuery,
} from "@orderly.network/hooks";
import { useAppContext, useDataTap } from "@orderly.network/react-app";
import { AccountStatusEnum } from "@orderly.network/types";
import { toast, usePagination } from "@orderly.network/ui";
import { useContext, useEffect, useMemo, useState } from "react";

export type GenerateKeyInfo = {
  key: string;
  screctKey: string;
  ip?: string;
  permissions?: string;
};

export const useApiManagerScript = (props?: {
  filterTags?: [string];
  keyStatus?: string;
}) => {
  const { filterTags, keyStatus } = props ?? {};
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCreatedDialog, setShowCreatedDialog] = useState(false);
  const [generateKey, setGenerateKey] = useState<GenerateKeyInfo | undefined>();
  const { configStore } = useContext(OrderlyContext);
  const brokerId = configStore.get("brokerId");
  const { wrongNetwork, disabledConnect } = useAppContext();

  const { state, account } = useAccount();

  const canCreateApiKey =
    (state.status === AccountStatusEnum.EnableTrading ||
      state.status === AccountStatusEnum.EnableTradingWithoutConnected) &&
    !wrongNetwork &&
    !disabledConnect;

  const { data } = useQuery<
    | undefined
    | {
        user_id: number;
        account_id: string;
      }
  >(
    `/v1/get_account?address=${account.address}&broker_id=${brokerId}&chain_type=${account.walletAdapter?.chainNamespace}`
  );

  const [
    keys,
    {
      generateOrderlyKey,
      setIPRestriction,
      removeOrderlyKey,
      resetOrderlyKeyIPRestriction,
      refresh,
      isLoading,
      error,
    },
  ] = useApiKeyManager({
    keyInfo: { key_status: keyStatus },
  });

  const [curPubKey, setCurPubKey] = useState<string | undefined>(undefined);

  useEffect(() => {
    account.keyStore
      .getOrderlyKey()
      ?.getPublicKey()
      .then((pubKey) => {
        setCurPubKey(pubKey);
      });
  }, [account, state]);

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
            .join(", "),
        });
        setShowCreatedDialog(true);
      };

      const generateKeyRes = await generateOrderlyKey(scope);

      toast.success("API key created");
      console.log("xxx generateKeyRes", generateKeyRes);

      if ((ipRestriction?.length || 0) > 0) {
        const key = generateKeyRes.key.startsWith("ed25519:")
          ? generateKeyRes.key
          : `ed25519:${generateKeyRes.key}`;
        const res = await setIPRestriction(key, ipRestriction!);
        console.log("set ip res", res);
        if (res.success) {
          createdSuccess(
            generateKeyRes,
            res.data.ip_restriction_list?.join(",")
          );
        }
      } else {
        createdSuccess(generateKeyRes, undefined);
      }
    } catch (err: any) {
      if (err?.message) toast.error(err?.message);
    }

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
      await removeOrderlyKey(item.orderly_key)
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
                account.destroyOrderlyKey();
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
    if (typeof key !== "undefined") {
      navigator.clipboard.writeText(key.replace("ed25519:", ""));
    }
    toast.success("API key copied");
  };
  const onCopyApiSecretKey = () => toast.success("Secret key copied");
  const onCopyIP = () => toast.success("Restricted IP copied");

  const keyList = useMemo(() => {
    return keys?.filter((e) => {
      const filterTag = filterTags ? filterTags?.includes(e.tag) : true;
      const filterCurKey = curPubKey
        ? !e.orderly_key.includes(curPubKey)
        : true;
      return filterTag && filterCurKey;
    });
  }, [keys, filterTags, curPubKey]);

  const verifyIP = (ip: string) => {
    const ipRegex =
      /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(,((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9]))*$/;
    return ipRegex.test(ip)
      ? ""
      : "The IP restriction format is incorrect. Please use the correct format: [xx.xx.xxx.x],[xx.xxx.xxx.xxx]";
  };

  const accountStatus =
    state.status === AccountStatusEnum.EnableTradingWithoutConnected
      ? AccountStatusEnum.EnableTradingWithoutConnected
      : AccountStatusEnum.EnableTrading;

  const address = useDataTap(data?.account_id, {
    accountStatus,
  });
  const uid = useDataTap(data?.user_id, {
    accountStatus,
  });

  const { pagination } = usePagination();

  return {
    address: address ?? "--",
    uid: `${uid ?? "--"}`,
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
    isLoading,
    pagination,
  };
};

export function capitalizeFirstChar(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export type ApiManagerScriptReturns = ReturnType<typeof useApiManagerScript>;
