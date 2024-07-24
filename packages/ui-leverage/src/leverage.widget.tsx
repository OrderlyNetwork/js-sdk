import { Leverage } from "./leverage.ui";
import { useLeverageScript } from "./leverage.script";

export const LeverageEditor = () => {
  const state = useLeverageScript();
  return <Leverage {...state} />;
};
