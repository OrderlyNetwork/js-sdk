import { FC, useContext, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/sheet";
import { EyeOff } from "lucide-react";
import { Divider } from "@/divider";
import { AssetAndMarginSheet } from "./assetAndMargin";
import { Numeral } from "@/text";
import { type API, AccountStatusEnum } from "@orderly.network/types";
import { OrderlyContext, useMarginRatio } from "@orderly.network/hooks";
import { Logo } from "@/logo";
import { AssetsContext } from "@/provider/assetsProvider";
import { EyeIcon, EyeOffIcon } from "@/icon";
import { Decimal } from "@orderly.network/utils";
import { OrderlyAppContext } from "@/provider";

interface AccountTotalProps {
  status: AccountStatusEnum;
  totalValue?: number;
  currency?: string;
  accountInfo?: API.AccountInfo;
}

export const AccountTotal: FC<AccountTotalProps> = (props) => {
  const { currency = "USDC", accountInfo } = props;
  // @ts-ignore
  const { logoUrl, errors } = useContext(OrderlyAppContext);
  const { onDeposit, onWithdraw, onSettle, visible, toggleVisible } =
    useContext(AssetsContext);

  const { currentLeverage } = useMarginRatio();

  //

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
      <div className="orderly-flex orderly-items-center orderly-text-base-contrast-54">
        <div className="orderly-flex orderly-flex-col">
          <div className="orderly-flex orderly-items-center orderly-text-4xs orderly-gap-2">
            <span>Total value</span>

            <span className="orderly-text-base">≈</span>
          </div>
          <div className="orderly-flex orderly-gap-2">
            --
            <span className="orderly-text-base-contrast/20">{currency}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="orderly-flex orderly-items-center orderly-cursor-pointer orderly-text-base-contrast-54">
          <div className="orderly-flex orderly-flex-col orderly-text-4xs">
            <div className="orderly-flex orderly-items-center">
              <span>Total value</span>
              <button
                className="orderly-text-primary-light orderly-px-2"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleVisible();
                }}
              >
                {visible ? (
                  <EyeOffIcon className="orderly-text-primary" size={12} />
                ) : (
                  <EyeIcon className="orderly-text-primary" size={12} />
                )}
              </button>

              <span className="orderly-text-base">≈</span>
            </div>
            <div className="orderly-flex orderly-gap-2 orderly-text-base-contrast">
              {balance}
              <span className="orderly-text-base-contrast-20">{currency}</span>
            </div>
          </div>
          <Divider vertical className="orderly-px-3" />

          <div className="orderly-border orderly-border-solid orderly-px-2 orderly-rounded orderly-border-primary-light orderly-text-primary-light orderly-text-4xs orderly-h-[30px] orderly-leading-[30px] orderly-flex orderly-items-center">
            {/* {`${new Decimal(currentLeverage).todp(2)}x`} */}
            <Numeral precision={2} surfix="x">
              {currentLeverage}
            </Numeral>
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
          onSettle={onSettle}
          maxLeverage={maxLerverage}
        />
      </SheetContent>
    </Sheet>
  );
};
