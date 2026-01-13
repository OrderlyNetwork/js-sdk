import { useReferralCodeFormScript } from "./referralCodeForm.script";
import { ReferralCodeForm, ReferralCodeFormProps } from "./referralCodeForm.ui";

export type ReferralCodeFormWidgetProps = Pick<
  ReferralCodeFormProps,
  "type" | "close"
>;

export const ReferralCodeFormWidget = (props: ReferralCodeFormWidgetProps) => {
  const state = useReferralCodeFormScript();
  return <ReferralCodeForm {...state} type={props.type} close={props.close} />;
};
