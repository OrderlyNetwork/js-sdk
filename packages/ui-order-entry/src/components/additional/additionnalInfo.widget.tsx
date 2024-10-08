import { AdditionalInfo } from "./additionalInfo.ui";
import { useAdditionalScript } from "./additional.script";

export const AdditionalInfoWidget = (props: {
  onValueChange?: (key: string, value: any) => void;
}) => {
  const state = useAdditionalScript();
  return <AdditionalInfo {...state} onValueChange={props.onValueChange} />;
};
