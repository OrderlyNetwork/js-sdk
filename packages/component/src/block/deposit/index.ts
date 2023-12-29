import { Deposit as DepositRoot } from "./deposit";
import { DepositWithDialog, DepositWithSheet } from "./dialog";
export type { DepositProps } from "./deposit";

type Deposit = typeof DepositRoot & {
  withDialog: typeof DepositWithDialog;
  withSheet: typeof DepositWithSheet;
};

const Deposit = DepositRoot as Deposit;

Deposit.withDialog = DepositWithDialog;
Deposit.withSheet = DepositWithSheet;

export { Deposit };
