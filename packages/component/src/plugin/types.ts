import { ReactNode } from "react";

export type ExtensionBuilder<Props = any> = () => Props;

export interface Extension<Props> {
  __isInternal: boolean;

  get name(): string;
  get positions(): ExtensionPosition[];

  initialize?: () => void;

  builder: ExtensionBuilder<Props>;

  render(ctx: any): ReactNode;
}

export enum ExtensionPosition {
  DepositForm = "depositForm",
  WithdrawForm = "withdrawForm",
  ListEmpty = "listEmpty",
  /**
   * Wallet button
   */
  WalletButton = "walletButton",
  Logo = "logo",
  Toast = "toast",
}

export type DepositProps = {
  onOk: () => void;
};
