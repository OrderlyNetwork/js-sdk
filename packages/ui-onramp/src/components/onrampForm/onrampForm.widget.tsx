import { FC } from "react";
import { useOnrampFormScript } from "./onrampForm.script";
import { OnrampFormUI } from "./onrampForm.ui";

export type OnrampFormWidgetProps = {
  close?: () => void;
};

export const OnrampForm: FC<OnrampFormWidgetProps> = (props) => {
  const state = useOnrampFormScript();
  return <OnrampFormUI {...state} {...props} />;
};
