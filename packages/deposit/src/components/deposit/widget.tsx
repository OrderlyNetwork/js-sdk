import { useDepositScript } from "./deposit.script";
import { Deposit } from "./deposit.ui";

export const DepositWidget = () => {
  const state = useDepositScript();
  return <Deposit {...state} />;
};
