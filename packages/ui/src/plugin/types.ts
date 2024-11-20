import { ElementType, ReactElement, ReactNode } from "react";

export type ExtensionBuilder<Props = any> = (
  props?: Partial<Props> & Record<string, any>
) => Props;

export type ExtensionPosition = ExtensionPositionEnum | string;

export interface Extension<Props extends any = {}> {
  __isInternal: boolean;

  get name(): string;
  get positions(): ExtensionPosition[];

  initialize?: () => void;

  builder: ExtensionBuilder<Props>;

  // render(ctx: any): ReactNode;
  render: ElementType<Props> | ((props: Props) => ReactElement);
}

export enum ExtensionPositionEnum {
  DepositForm = "depositForm",
  WithdrawForm = "withdrawForm",
  // ListEmpty = "listEmpty",
  // Positions = "positions",
  // Orders = "orders",
  // MainNav = "mainNav",
  // SideNav = "sideNav",
  /**
   * Wallet button
   */
  AccountMenu = "accountMenu",
  // Logo = "logo",
  // Toast = "toast",
  /// Layout components
  MainMenus = "mainMenus",
  // PortfolioLayout = "portfolioLayout",
  // TradingRewardsLayout = "tradingRewardsLayout",
  // AffiliateLayoutLayout = "affiliateLayoutLayout",
  EmptyDataIdentifier = "emptyDataIdentifier",
}

export type DepositProps = {
  onOk: () => void;
};
