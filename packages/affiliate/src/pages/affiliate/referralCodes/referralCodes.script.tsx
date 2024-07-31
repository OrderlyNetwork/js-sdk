import { RefferalAPI, useLocalStorage } from "@orderly.network/hooks";
import { useReferralContext } from "../../../hooks";
import { addQueryParam, copyText } from "../../../utils/utils";
import { modal } from "@orderly.network/ui";
import { useMemo } from "react";
import { EditReferralRate } from "./editReferralRate";

export type ReferralCodeType = RefferalAPI.ReferralCode & { isPined?: boolean };

export type ReferralCodesReturns = {
  copyCode: (code: string) => void;
  copyLink: (code: string) => void;
  editRate: (code: ReferralCodeType) => void;
  setPinCode: (code: string, del?: boolean) => void;
  codes?: ReferralCodeType[];
};

export const useReferralCodesScript = (): ReferralCodesReturns => {
  const { referralInfo, referralLinkUrl, mutate } = useReferralContext();

  const copyLink = (code: string) => {
    copyText(addQueryParam(referralLinkUrl, "ref", code));
  };
  const copyCode = (code: string) => {
    copyText(code);
  };
  const editRate = (code: ReferralCodeType) => {
    modal.show(EditReferralRate, { code: { ...code }, mutate });
  };

  const [pinCodes, setPinCodes] = useLocalStorage<string[]>(
    "orderly_referral_codes",
    [] as string[]
  );
  const setPinCode = (code: string, del?: boolean) => {
    if (del) {
      const index = pinCodes.findIndex((item: string) => item === code);
      if (index !== -1) {
        pinCodes.splice(index, 1);
      }
    } else {
      pinCodes.splice(0, 0, code);
    }

    if (pinCodes.length > 6) {
      pinCodes.splice(pinCodes.length - 1, 1);
    }

    setPinCodes([...pinCodes]);
  };

  const codes = useMemo((): ReferralCodeType[] => {
    if (!referralInfo?.referrer_info.referral_codes)
      return [] as ReferralCodeType[];
    const referralCodes = [...referralInfo?.referrer_info.referral_codes];

    const pinedItems: ReferralCodeType[] = [];

    for (let i = 0; i < pinCodes.length; i++) {
      const code = pinCodes[i];

      const index = referralCodes.findIndex((item) => item.code === code);
      if (index !== -1) {
        pinedItems.push({ ...referralCodes[index], isPined: true });
        referralCodes.splice(index, 1);
      }
    }

    return [...pinedItems, ...referralCodes];
  }, [referralInfo?.referrer_info.referral_codes, pinCodes]);

  return {
    copyCode,
    copyLink,
    editRate,
    setPinCode,
    codes: [codes[0], codes[1]],
  };
};
