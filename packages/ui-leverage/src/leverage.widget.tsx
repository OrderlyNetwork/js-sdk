import { Leverage } from "./leverage.ui";
import { useLeverageScript } from "./useBuilder.script";

export const LeverageEditor = () => {
  const state = useLeverageScript();
  return <Leverage {...state} />;
};
