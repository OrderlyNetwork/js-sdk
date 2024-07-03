import { Leverage } from "./leverage.ui";
import { useLeverageBuilder } from "./useBuilder.script";

export const LeverageEditor = () => {
  const state = useLeverageBuilder();
  return <Leverage {...state} />;
};
