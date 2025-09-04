import React from "react";
import { useAdditionalScript } from "./additional.script";
import { AdditionalInfo, AdditionalInfoProps } from "./additionalInfo.ui";

export const AdditionalInfoWidget: React.FC<AdditionalInfoProps> = (props) => {
  const state = useAdditionalScript();
  return <AdditionalInfo {...state} {...props} />;
};
