import { FC, useContext, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/sheet";
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
import { useTradingPageContext } from "@/page/trading/context/tradingPageContext";

interface AccountTotalProps {
  status: AccountStatusEnum;
  totalValue?: number;
  currency?: string;
  accountInfo?: API.AccountInfo;
}

export const AccountTotal: FC<AccountTotalProps> = (props) => {
  const { currency = "USDC", accountInfo } = props;
  // @ts-ignore
  const { errors } = useContext(OrderlyAppContext);
  const { onDeposit, onWithdraw, onSettle, visible, toggleVisible } =
    useContext(AssetsContext);

  const { currentLeverage } = useMarginRatio();

  const { wrongNetwork } = useTradingPageContext();

  //

  const balance = useMemo(() => {
    if (props.status < AccountStatusEnum.EnableTrading || wrongNetwork) {
      return "--";
    }

    return (
      <Numeral rule="price" visible={visible}>
        {props.totalValue ?? 0}
      </Numeral>
    );
  }, [props.status, props.totalValue, visible, wrongNetwork]);

  const maxLerverage = useMemo(() => {
    if (wrongNetwork) return "--";
    return accountInfo?.max_leverage ?? "-";
  }, [accountInfo, wrongNetwork]);

  const balanceInfo = useMemo(() => {
    return (
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
      </div>
    );
  }, [balance, currency, visible]);

  if (props.status < AccountStatusEnum.EnableTrading) {
    return balanceInfo;
  }

  const trigger = () => {
    return (
      <div className="orderly-flex orderly-items-center orderly-text-base-contrast-54">
        {balanceInfo}
        {!wrongNetwork && <Divider vertical className="orderly-px-3" />}

        {!wrongNetwork && (
          <div className="orderly-flex orderly-gap-[10px] orderly-items-center">
            <div className="orderly-border orderly-border-solid orderly-px-2 orderly-rounded orderly-border-primary-light orderly-text-primary-light orderly-text-4xs orderly-h-[30px] orderly-leading-[30px] orderly-flex orderly-items-center">
              {/* {`${new Decimal(currentLeverage).todp(2)}x`} */}
              <Numeral precision={2} surfix="x">
                {currentLeverage}
              </Numeral>
            </div>
          </div>
        )}
      </div>
    );
  };
  if (wrongNetwork) {
    return trigger();
  }

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger()}</SheetTrigger>
      <SheetContent
        id="orderly-asset-and-margin-sheet"
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="orderly-bg-base-600"
      >
        <SheetHeader
          id="orderly-asset-and-margin-sheet-title"
          leading={<Logo.secondary size={30} />}
        >
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
