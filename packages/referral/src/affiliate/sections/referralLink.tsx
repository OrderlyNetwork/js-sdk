import { FC } from "react";
import { HintIcon, CopyIcon } from "../icons";
import { Input, Numeral, cn, toast } from "@orderly.network/react";
// import "@orderly.network/react/dist/styles.css";


export const ReferralLink = () => {

    return (
        <div className="orderly-p-6 orderly-outline orderly-outline-1 orderly-outline-base-600">
            <div className="orderly-text-base 2xl:orderly-text-lg">
                Referral link
            </div>

            <div className="orderly-mt-4 orderly-flex orderly-flex-col lg:orderly-flex-row orderly-gap-3">

            <div className="lg:orderly-w-1/6 orderly-flex orderly-items-center ">
                <Info title="Earn" value={"0"} className="orderly-flex-1"/>
                <Info title="Share" value={"0"} className="orderly-flex-1"/>
            </div>

            <div className="lg:orderly-w-5/6 orderly-flex orderly-flex-col orderly-gap-2">
                <CopyInfo title="Referral code" value="DYOL0VRH" />
                <CopyInfo title="Referral link" value="DYOL0VRH" />

            </div>

            </div>
        </div>
    );
}

const Info: FC<{ title: string, value: any, className?: string }> = (props) => {

    const { title, value, className } = props;

    return (
        <div className={className}>
            <div className={cn("orderly-flex orderly-items-center orderly-text-3xs md:orderly-text-2xs xl:orderly-text-xs" )}>
                {title}
                <HintIcon className="orderly-ml-2" />
            </div>
            <div className="orderly-text-[24px] lg:orderly-text-[26px] 2xl:orderly-text-[28px]">
                <Numeral>
                    {value}
                </Numeral>
            </div>
        </div>
    );
}

const CopyInfo: FC<{ title: string, value: string }> = (props) => {
    const { title, value } = props;

    return (
        <div className="orderly-flex orderly-p-3 orderly-items-center orderly-bg-base-500 orderly-rounded-md">
            <div className="orderly-text-base-contrast-54 orderly-text-3xs lg:orderly-text-2xs 2xl:orderly-text-xs">{title}</div>
            <div className="orderly-flex-1 orderly-text-right orderly-mr-3 orderly-text-xs 2xl:orderly-text-base">{value}</div>
            <CopyIcon
                className="orderly-mr-3 orderly-cursor-pointer"
                onClick={() => { toast.success("will be realized") }}
            />
        </div>
    );
}