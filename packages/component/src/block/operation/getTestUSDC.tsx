import { X } from "lucide-react";
import {
  useMutation,
  useAccount,
  useConfig,
  OrderlyContext,
} from "@orderly.network/hooks";
import { useCallback, useContext, useEffect, useState } from "react";
import { AccountStatusEnum } from "@orderly.network/types";
import { modal } from "@/modal";
import { toast } from "@/toast";

const localStorageItem = "Orderly_GetTestUSDC";

export const GetTestUSDC = () => {
  const { account, state } = useAccount();
  const { configStore } = useContext<any>(OrderlyContext);
  const [show, setShow] = useState(false);
  const config = useConfig();

  useEffect(() => {
    const value = localStorage.getItem(
      `${localStorageItem}_${state.accountId}`
    );

    if (!value) {
      setShow(() => true);
    }
  }, []);

  const [getTestUSDC, { isMutating }] = useMutation(
    `${config.get("operatorUrl")}/v1/faucet/usdc`
  );

  const onCloseClick = useCallback(() => {
    setShow(false);
    localStorage.setItem(`${localStorageItem}_${state.accountId}`, "1");
  }, []);

  const onGetClick = useCallback(
    (event: any) => {
      event.preventDefault();
      const toastId = toast.loading("Getting test USDC...");
      if (!account || !account.wallet) {
        return;
      }

      getTestUSDC({
        chain_id: account.wallet.chainId.toString(),
        user_address: state.address,
        broker_id: configStore.get("brokerId"),
      }).then(
        (res: any) => {
          if (res.success) {
            toast.dismiss(toastId);
            return modal.confirm({
              title: "Get test USDC",
              content:
                "1,000 USDC will be added to your balance. Please note this may take up to 3 minutes. Please check back later.",
              onOk: () => {
                return Promise.resolve();
              },
            });
          } else {
            res.message && toast.error(res.message);
            return Promise.reject(res);
          }
        },
        (error: Error) => {
          toast.dismiss(toastId);
          toast.error(error.message);
        }
      );
    },
    [state]
  );

  if (!show) {
    return null;
  }

  return (
    <div className="flex justify-between items-center fixed left-0 right-0 bottom-[64px] h-[40px] bg-base-300 z-20 px-2 animate-in fade-in ">
      <div className="text-sm text-base-contrast/50 cursor-pointer">
        <span className="text-primary-light" onClick={onGetClick}>
          Get test USDC
        </span>{" "}
        and start trading!
      </div>
      {/* Get test USDC and earn an NFT in our testnet campaign! */}
      <div className="p-2">
        <button
          className="w-[16px] h-[16px] rounded-full bg-primary-light flex justify-center items-center"
          onClick={onCloseClick}
        >
          <X size={14} className="text-base-100" />
        </button>
      </div>
    </div>
  );
};
