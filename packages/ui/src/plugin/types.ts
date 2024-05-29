import { ReactNode } from "react";

export type ExtensionBuilder<Props = any> = () => Props;

export type ExtensionPosition = ExtensionPositionEnum | string;

export interface Extension<Props extends any = {}> {
  __isInternal: boolean;

  get name(): string;
  get positions(): ExtensionPosition[];

  initialize?: () => void;

  builder: ExtensionBuilder<Props>;

  render(ctx: any): ReactNode;
}

export enum ExtensionPositionEnum {
  DepositForm = "depositForm",
  WithdrawForm = "withdrawForm",
  ListEmpty = "listEmpty",
  /**
   * Wallet button
   */
  WalletButton = "walletButton",
  Logo = "logo",
  Toast = "toast",
  /// Layout components
  PortfolioLayout = "portfolioLayout",
}

export type DepositProps = {
  onOk: () => void;
};
