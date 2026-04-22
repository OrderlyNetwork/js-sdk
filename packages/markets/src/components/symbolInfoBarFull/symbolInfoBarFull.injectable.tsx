import { injectable } from "@orderly.network/ui";
import { SymbolInfoBarFull } from "./symbolInfoBarFull.ui";

export const SymbolInfoBarFullInjectable = injectable(
  SymbolInfoBarFull,
  "Trading.SymbolInfoBar.Desktop",
);
