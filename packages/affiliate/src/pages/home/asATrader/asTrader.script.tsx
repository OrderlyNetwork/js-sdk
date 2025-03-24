import { useState } from "react";
import {
  useAccount,
  useCheckReferralCode,
  useMutation,
} from "@orderly.network/hooks";
import { TabTypes, useReferralContext } from "../../../hooks";
import { AccountStatusEnum } from "@orderly.network/types";
import { toast, useScreen } from "@orderly.network/ui";
import { useTranslation } from "@orderly.network/i18n";

export const useAsTraderScript = () => {
  const { t } = useTranslation();

  const {
    isTrader,
    referralInfo,
    setShowHome,
    bindReferralCodeState,
    setTab,
    mutate,
    wrongNetwork,
    disabledConnect,
  } = useReferralContext();

  const { state } = useAccount();

  const isSignIn =
    !disabledConnect &&
    (state.status === AccountStatusEnum.EnableTrading ||
      state.status === AccountStatusEnum.EnableTradingWithoutConnected);

  const onEnterTraderPage = () => {
    setTab(TabTypes.trader);
    setShowHome(false);
  };

  const [code, setCode] = useState("");
  const [open, setOpen] = useState(false);

  const {
    isExist,
    error: checkCodeError,
    isLoading,
  } = useCheckReferralCode(code);

  const hide = () => {
    setOpen(false);
  };

  const [bindCode, { error, isMutating }] = useMutation(
    "/v1/referral/bind",
    "POST"
  );

  const onClickConfirm = async () => {
    try {
      await bindCode({ referral_code: code });
      toast.success(t("affiliate.referralCode.bound"));
      mutate();
      if (bindReferralCodeState) {
        bindReferralCodeState(true, null, hide, { tab: 1 });
      } else {
        hide();
      }
    } catch (e: any) {
      let errorText = `${e}`;
      if ("message" in e) {
        errorText = e.message;
      }

      if ("referral code not exist" === errorText) {
        errorText = t("affiliate.referralCode.notExist");
      }

      if (bindReferralCodeState) {
        toast.error(errorText);
        bindReferralCodeState(false, e, hide, {});
      } else {
        toast.error(errorText);
      }
    }
  };

  const { isMobile } = useScreen();

  return {
    isSignIn,
    isTrader,
    isLoading,
    referralInfo,
    // isTrader: true,
    // isLoading: false,
    // referralInfo: MockData.referralInfo,
    onEnterTraderPage,
    code,
    setCode,
    open,
    setOpen,
    onClickConfirm,
    isExist,
    wrongNetwork,
    isMobile,
  };
};

export type AsTraderReturns = ReturnType<typeof useAsTraderScript>;
