import { useReferralCodeFormScript } from "./referralCodeForm.script";
import { ReferralCodeForm } from "./referralCodeForm.ui";

export type ReferralCodeFormWidgetProps = {
  type: "create" | "edit";
  close?: () => void;
  onSuccess?: () => void;
  referralCode?: string;
  maxRebateRate: number;
  referrerRebateRate?: number;
  field?: "referralCode" | "rebateRate";
};

export const ReferralCodeFormWidget = (props: ReferralCodeFormWidgetProps) => {
  const state = useReferralCodeFormScript(props);
  return <ReferralCodeForm {...state} {...props} />;
};
