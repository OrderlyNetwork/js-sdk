/**
 * Module augmentation: maps interceptor target paths to their component props types.
 * Import from @orderly.network/ui-scaffold to enable typed props in
 * createInterceptor('Account.AccountMenu', ...) and createInterceptor('Layout.MainMenus', ...).
 */
/// <reference types="@orderly.network/plugin-core" />
import type { AccountMenuProps } from "./components/accountMenu/menu.ui";
import type { MainNavItemsProps } from "./components/main/mainMenus/mainNavMenus.ui";

declare module "@orderly.network/plugin-core" {
  interface InterceptorTargetPropsMap {
    "Account.AccountMenu": AccountMenuProps;
    "Layout.MainMenus": MainNavItemsProps;
  }
}
