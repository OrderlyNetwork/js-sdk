import { FC, useContext, useMemo } from "react";
import { type AccountStatusBar } from "../accountStatusBar";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/sheet";
import { EyeOff } from "lucide-react";
import { Divider } from "@/divider";
import { AssetAndMarginSheet } from "./assetAndMargin";
import { Numeral } from "@/text";
import { type API, AccountStatusEnum } from "@orderly.network/types";
import { OrderlyContext } from "@orderly.network/hooks";
import { Logo } from "@/logo";
import { AssetsContext } from "@/provider/assetsProvider";
import { EyeIcon, EyeOffIcon } from "@/icon";

interface AccountTotalProps {
  status: AccountStatusEnum;
  totalValue?: number;
  currency?: string;
  accountInfo?: API.AccountInfo;
}

export const AccountTotal: FC<AccountTotalProps> = (props) => {
  const { currency = "USDC", accountInfo } = props;
  const { logoUrl } = useContext(OrderlyContext);
  const { onDeposit, onWithdraw, onSettlement, visible, toggleVisible } =
    useContext(AssetsContext);

  // console.log("accountInfo", props);

  const balance = useMemo(() => {
    if (props.status < AccountStatusEnum.EnableTrading) {
      return "--";
    }

    return (
      <Numeral rule="price" visible={visible}>
        {props.totalValue ?? 0}
      </Numeral>
    );
  }, [props.status, props.totalValue, visible]);

  const maxLerverage = useMemo(() => {
    return accountInfo?.max_leverage ?? "-";
  }, [accountInfo]);

  if (props.status < AccountStatusEnum.EnableTrading) {
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
          <div className="flex flex-col text-xs">
            <div className="flex items-center text-base-contrast/70">
              <span>Total Value</span>
              <button
                className="text-primary px-2"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleVisible();
                }}
              >
                {visible ? (
                  <EyeIcon className="text-primary" size={12} />
                ) : (
                  <EyeOffIcon className="text-primary" size={12} />
                )}
              </button>

              <span className="text-base">≈</span>
            </div>
            <div className="flex gap-2">
              {balance}
              <span className="text-base-contrast/20">{currency}</span>
            </div>
          </div>
          <Divider vertical className="px-3" />

          <div className="border border-solid px-2 rounded border-primary text-primary text-sm">
            {`${maxLerverage}x`}
          </div>
        </div>
      </SheetTrigger>
      <SheetContent onOpenAutoFocus={(event) => event.preventDefault()}>
        <SheetHeader leading={<Logo image={logoUrl} size={30} />}>
          Assets & Margin
        </SheetHeader>
        <AssetAndMarginSheet
          onDeposit={onDeposit}
          onWithdraw={onWithdraw}
          onSettlement={onSettlement}
          maxLeverage={maxLerverage}
        />
      </SheetContent>
    </Sheet>
  );
};
