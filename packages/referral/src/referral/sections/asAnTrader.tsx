import { Button, Numeral, cn, modal } from "@orderly.network/react";
import { useContext, useMemo } from "react";
import { OverwiteCard, ReferralContext } from "../../hooks/referralContext";
import { USDCIcon } from "../../affiliate/icons";
import { ArrowRightIcon } from "../icons/arrowRight";
import { TraderIcon } from "../icons/trader";
import { ReferralInputCode } from "./enterCode";
import { commify } from "@orderly.network/utils";
import { refCommify } from "../../utils/decimal";
import { useTranslation } from "../../locale/useTranslation";
export const AsAnTrader = () => {

  const state = useContext(ReferralContext);
  const { referralInfo, isTrader, mutate, bindReferralCodeState, onEnterTraderPage: enterTraderPage, overwrite } = state;
  const tr = useTranslation();

  const enterCode = () => {
    modal.show(ReferralInputCode, { mutate, bindReferralCodeState });
  };

  const bottomInfo = useMemo(() => {
    const totalReferrerRebate = referralInfo?.referee_info?.total_referee_rebate;

    if (isTrader) {
      return (
        <div className="orderly-mt-3 orderly-text-[24px] lg:orderly-txt-[26px] 2xl:orderly-text-[30[px] orderly-flex orderly-justify-between orderly-items-end">

          <div>
            <div className="orderly-text-xs md:orderly-text-base 2xl:orderly-text-[18px] orderly-text-base-contrast-80">{tr("referral.trader.card.rebate")}</div>
            <div className="orderly-flex-1 orderly-flex orderly-items-center orderly-mt-3">
              <div className="orderly-mr-3 orderly-w-[28px] orderly-h-[28px] xl:orderly-w-[32px] xl:orderly-h-[32px] 2xl:orderly-w-[36px] 2xl:orderly-h-[36px]">
                <USDCIcon width={"100%"} height={"100%"} />
              </div>
              <Numeral >{(totalReferrerRebate || 0)}</Numeral>
            </div>
          </div>

          <button onClick={() => enterTraderPage?.({ tab: 1 })} className="orderly-flex orderly-items-center orderly-text-xs md:orderly-text-base 2xl:orderly-text-lg orderly-gap-2">
            {tr("referral.trader.card.enter")}
            <ArrowRightIcon fill="white" fillOpacity={0.98} />
          </button>
        </div>
      );
    }


    return (
      <div className="orderly-flex orderly-justify-between orderly-mt-2 orderly-items-center">
        <Button
          id="referral_as_a_trader_btn"
          onClick={enterCode}
          className="orderly-bg-white xl:orderly-text-lg 2xl:orderly-text-lg orderly-px-3 orderly-h-[44px] xl:orderly-h-[54px] orderly-text-[#282E3A]"
        >
          {tr("referral.not.trader.card.btn")}
        </Button>

        <div>
          <div className="orderly-text-[22px] md:orderly-text-[24px] lg:orderly-text-[26px] xl:orderly-text-[26px] 2xl:orderly-text-[28px]">{tr("referral.not.trader.card.hint.title")}</div>
          <div className="orderly-text-3xs 2xl:orderly-text-xs orderly-text-right orderly-text-base-contrast-54">{tr("referral.not.trader.card.hint.subtitle")}</div>
        </div>
      </div>
    );

  }, [referralInfo?.referee_info?.total_referee_rebate, isTrader, enterCode, overwrite, tr]);


  const className = useMemo(() => {
    if (typeof overwrite?.ref?.card === 'object') {
      return (overwrite?.ref?.card as OverwiteCard)?.traderClassName;
    }

    return "";
  }, [overwrite?.ref?.card]);

  const icon = useMemo(() => {

    if (typeof overwrite?.ref?.card === 'object' && (overwrite?.ref?.card as OverwiteCard)?.traderIcon !== undefined) {
      return (overwrite?.ref?.card as OverwiteCard)?.traderIcon;
    }

    return <TraderIcon width={'100%'} height={'100%'} />

  }, [overwrite]);



  const children = useMemo(() => {
    if (typeof overwrite?.ref?.card === 'object' &&
      "trader" in (overwrite?.ref?.card as OverwiteCard)
    ) {
      return ((overwrite?.ref?.card as OverwiteCard).trader as Function)(state);
    }

    return (
      <div className={cn("orderly-rounded-xl orderly-p-6 orderly-w-full orderly-bg-[rgba(0,104,92,1)] orderly-h-[195px] lg:orderly-h-[199px] xl:orderly-h-[216px] 2xl:orderly-h-[248px] orderly-flex orderly-flex-col orderly-justify-between", className)}>
        <div className="orderly-flex orderly-justify-between orderly-relative">
          <div className="orderly-justify-between orderly-max-w-[211px] md:orderly-max-w-[310px] lg:orderly-max-w-[480px] xl:orderly-max-w-[264px] 2xl:orderly-max-w-[282px]">
            <div className="orderly-text-2xl lg:orderly-text-[26px] xl:orderly-text-[28px] 2xl:orderly-text-[30px]">{isTrader ? tr("referral.trader.card.title") : tr("referral.not.trader.card.title")}</div>
            {!isTrader && <div className="orderly-mt-6 orderly-text-2xs lg:orderly-text-xs md:orderly-text-xs xl:orderly-text-xs 2xl:orderly-text-base orderly-text-base-contrast-54">
              {tr("referral.not.trader.card.subtitle")}
            </div>}
          </div>
          <div className="orderly-absolute orderly-top-0 orderly-right-0 orderly-w-[72px] orderly-h-[72px] lg:orderly-w-[64px] lg:orderly-h-[64px] xl:orderly-w-[90px] xl:orderly-h-[90px] 2xl:orderly-w-[120px] 2xl:orderly-h-[120px]">
            {icon}
          </div>
        </div>
  
        {bottomInfo}
      </div>
    );
  }, [overwrite?.ref?.card, state]);

  return (<>{children}</>)
};
