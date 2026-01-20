import { ReferralCodeFormField, ReferralCodeFormType } from "../../../../types";
import { useReferralCodeFormScript } from "./referralCodeForm.script";
import { ReferralCodeForm } from "./referralCodeForm.ui";

export type ReferralCodeFormWidgetProps = {
  type: ReferralCodeFormType;
  close?: () => void;
  onSuccess?: () => void;
  referralCode?: string;
  maxRebateRate: number;
  referrerRebateRate?: number;
  field?: ReferralCodeFormField;
  focusField?: ReferralCodeFormField;
  accountId?: string;
};

export const ReferralCodeFormWidget = (props: ReferralCodeFormWidgetProps) => {
  const state = useReferralCodeFormScript(props);
  return <ReferralCodeForm {...state} {...props} />;
};
