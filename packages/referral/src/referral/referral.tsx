import { useContext, useMemo } from "react";
import { ArrowRightIcon } from "./icons/arrowRight";
import { Card } from "./sections/card";
import { Introduce } from "./sections/introduce";
import { ReferralContext } from "../hooks/referralContext";
import { GradientText } from "../components/gradientText";
import { OrderlyAppContext } from "@orderly.network/react";
import { useTranslation } from "../locale/useTranslation";

export const Referral = () => {

  return (
    <div className="orderly-flex orderly-flex-col orderly-items-center orderly-w-full orderly-p-4 orderly-text-base-contrast">
      <_Top />

      <div className="orderly-w-full md:orderly-w-full lg:orderly-w-[636px] xl:orderly-w-[892px] 2xl:orderly-w-[992px]">
        <Card />
        <Introduce />
      </div>

    </div>
  );
};


const _Top = () => {


  const { brokerName } = useContext(OrderlyAppContext);


  const { learnAffiliate, learnAffiliateUrl, overwrite } = useContext(ReferralContext);
  const handleOpenNewTab = (url: string) => {
    window.open(url, '_blank');
  };



  const state = useContext(ReferralContext);
  const tr = useTranslation();
  
  const texts = useMemo(() => {
    const name = overwrite?.ref?.gradientTitle || brokerName || "";
    const text = tr("refferal.title", {
      values: {name }
    });

    
    const list = `${text}`.split(name);
    if (list.length === 2) {
      return [
        { text: `${list[0]} ` },
        { text: `${name}`, gradient: true },
        { text: ` ${list[1]}` },
      ];
    }
    return [
      { text },
    ]
  }, [brokerName, tr, overwrite?.ref?.gradientTitle]);

  const children = useMemo(() => {


    if (overwrite?.ref?.top !== undefined) {
      return overwrite.ref.top(state);
    }

    return (<div className="orderly-text-center">
      <div className="orderly-text-[32px] lg:orderly-text-[42px] xl:orderly-text-[50px] 2xl:orderly-text-[56px] orderly-font-bold" style={{ lineHeight: "normal" }}>
        <GradientText texts={texts} />
      </div>
      <div className="orderly-mt-8 orderly-text-sm md:orderly-text-base lg:orderly-text-lg xl:orderly-text-lg 2xl:orderly-text-xl orderly-text-base-contrast-80">
        {tr("refferal.subtitle")}
      </div>
      <div className="orderly-flex orderly-justify-center">
        <button
          onClick={() => {
            if (learnAffiliate) {
              learnAffiliate?.();
            } else if (learnAffiliateUrl) {
              handleOpenNewTab(learnAffiliateUrl);
            }
          }}
          className="orderly-flex orderly-items-center orderly-mt-3 orderly-text-link"
        >
          <div className="orderly-flex orderly-text-3xs 2xl:orderly-text-xs orderly-items-center">
            {tr("refferal.linkUrl")}
            <ArrowRightIcon className="orderly-ml-2 orderly-fill-link" fillOpacity={1} />
          </div>
        </button>
      </div>
    </div>);
  }, [overwrite?.ref?.top, state, tr, texts]);

  return (<>{children}</>);
}