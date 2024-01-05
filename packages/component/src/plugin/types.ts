import { ReactNode } from "react";

export interface Extension {
  get name(): string;
  get positions(): ExtensionPosition[];

  initialize?: () => void;

  render(): ReactNode;
}

export enum ExtensionPosition {
  DepositForm = "depositForm",
  WithdrawForm = "withdrawForm",
}
