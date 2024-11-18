import { useContext } from "react";
import { ArrorDownIcon } from "../icons/arrowDown";
import { Apply } from "./apply";
import { Earn } from "./earn";
import { Share } from "./share";
import { ReferralContext } from "../../hooks/referralContext";
import { useTranslation } from "../../locale/useTranslation";

export const Introduce = () => {

    const state = useContext(ReferralContext);
    const tr = useTranslation()
    const { overwrite } = state;

    if (typeof overwrite?.ref?.step === 'function') {
        return (overwrite?.ref?.step as Function)(state);
    }

    return (<div className="orderly-border orderly-border-base-100 orderly-rounded-xl orderly-p-6 orderly-mt-8">
        <div className="orderly-flex orderly-justify-center orderly-mb-6 orderly-text-[15px] md:orderly-text-[16px] xl:orderly-text-[18px] 2xl:orderly-text-[20px]">{tr("referral.step.title")}</div>

        <div className="orderly-flex orderly-flex-col sm:orderly-flex-col md:orderly-flex-col lg:orderly-flex-row xl:orderly-flex-row 2xl:orderly-flex-row">
            <div className="lg:orderly-flex-1"><Apply /></div>
            <div className="orderly-flex orderly-justify-center orderly-items-center orderly-py-3 lg:orderly-px-3 lg:orderly-transform lg:orderly-rotate-[270deg] xl:orderly-transform xl:orderly-rotate-[270deg]"><ArrorDownIcon className="orderly-fill-primary-darken" /></div>
            <div className="lg:orderly-flex-1"><Share /></div>
            <div className="orderly-flex orderly-justify-center orderly-items-center orderly-py-3 lg:orderly-px-3 lg:orderly-transform lg:orderly-rotate-[270deg] xl:orderly-transform xl:orderly-rotate-[270deg]"><ArrorDownIcon className="orderly-fill-primary-darken" /></div>
            <div className="lg:orderly-flex-1"><Earn /></div>

        </div>
    </div>);
}