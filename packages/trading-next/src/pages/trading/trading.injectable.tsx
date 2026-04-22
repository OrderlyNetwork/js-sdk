import { injectable } from "@orderly.network/ui";
import { DesktopLayout } from "./trading.ui.desktop";

export const InjectableDesktopLayout = injectable(
  DesktopLayout,
  "Trading.Layout.Desktop",
);
