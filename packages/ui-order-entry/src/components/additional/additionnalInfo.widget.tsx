import { AdditionalInfo, AdditionalInfoProps } from "./additionalInfo.ui";
import { useAdditionalScript } from "./additional.script";

export const AdditionalInfoWidget = (props: AdditionalInfoProps) => {
  const state = useAdditionalScript();
  return <AdditionalInfo {...state} {...props} />;
};
