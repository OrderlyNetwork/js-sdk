import { ReactNode } from "react";

export interface Extension<Props> {
  __isInternal: boolean;

  get name(): string;
  get positions(): ExtensionPosition[];

  initialize?: () => void;

  render(props: Props): ReactNode;
}

export enum ExtensionPosition {
  DepositForm = "depositForm",
  WithdrawForm = "withdrawForm",
}

export type DepositProps = {
  onOk: () => void;
};
