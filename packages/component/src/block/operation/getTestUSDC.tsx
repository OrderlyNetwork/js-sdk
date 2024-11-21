import { X } from "lucide-react";
import {
  useMutation,
  useAccount,
  useConfig,
  OrderlyContext,
} from "@orderly.network/hooks";
import { useCallback, useContext, useEffect, useState } from "react";
import { AccountStatusEnum } from "@orderly.network/types";
import { modal } from "@orderly.network/ui";
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
      if (!account || !account.walletAdapter) {
        return;
      }

      getTestUSDC({
        chain_id: account.walletAdapter.chainId.toString(),
        user_address: state.address,
        broker_id: configStore.get("brokerId"),
      })
        .then((res: any) => {
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
            return Promise.reject(res);
          }
        })
        .catch((err) => {
          toast.dismiss(toastId);
          err.message && toast.error(err.message);
        });
    },
    [state]
  );

  if (!show) {
    return null;
  }

  return (
    <div
      id="orderly-get-usdc"
      className="orderly-flex orderly-justify-between orderly-items-center orderly-fixed orderly-left-0 orderly-right-0 orderly-bottom-[64px] orderly-h-[40px] orderly-bg-base-700 orderly-z-20 orderly-px-2 orderly-animate-in orderly-fade-in"
    >
      <div className="orderly-text-3xs orderly-text-base-contrast/50 orderly-cursor-pointer">
        <span className="orderly-text-primary-light" onClick={onGetClick}>
          Get test USDC
        </span>{" "}
        and start trading!
      </div>
      {/* Get test USDC and earn an NFT in our testnet campaign! */}
      <div className="orderly-p-2">
        <button
          className="orderly-w-[16px] orderly-h-[16px] orderly-rounded-full orderly-bg-primary-light orderly-flex orderly-justify-center orderly-items-center"
          onClick={onCloseClick}
        >
          {/* @ts-ignore */}
          <X size={14} className="orderly-text-base-100" />
        </button>
      </div>
    </div>
  );
};
