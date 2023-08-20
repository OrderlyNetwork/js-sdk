import { FC, useMemo } from "react";
import { type AccountStatusBar } from "../accountStatusBar";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/sheet";
import { EyeOff } from "lucide-react";
import { Divider } from "@/divider";
import { AssetAndMarginSheet } from "./assetAndMargin";
import { Numeral } from "@/text";

interface AccountTotalProps {
  status: AccountStatusBar;
  balance?: string;
  currency?: string;
}

export const AccountTotal: FC<AccountTotalProps> = (props) => {
  const { currency = "USDC" } = props;

  const balance = useMemo(() => {
    if (props.status !== "SignedIn") {
      return "--";
    }

    return <Numeral rule="price">{props.balance ?? 0}</Numeral>;
  }, [props.status, props.balance]);

  if (props.status !== "SignedIn") {
    return (
      <div className="flex items-center">
        <div className="flex flex-col">
          <div className="flex items-center text-xs text-base-contrast/70 gap-2">
            <span>Total Value</span>

            <span className="text-base">≈</span>
          </div>
          <div className="flex gap-2">
            --
            <span className="text-base-contrast/20">{currency}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="flex items-center cursor-pointer">
          <div className="flex flex-col">
            <div className="flex items-center text-xs text-base-contrast/70 gap-2">
              <span>Total Value</span>
              <EyeOff className="text-primary" size={14} />
              <span className="text-base">≈</span>
            </div>
            <div className="flex gap-2">
              {balance}
              <span className="text-base-contrast/20">{currency}</span>
            </div>
          </div>
          <Divider vertical className="px-3" />

          <div className="border border-solid px-2 rounded border-primary text-primary text-sm">
            1x
          </div>
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>Assets & Margin</SheetHeader>
        <AssetAndMarginSheet />
      </SheetContent>
    </Sheet>
  );
};
