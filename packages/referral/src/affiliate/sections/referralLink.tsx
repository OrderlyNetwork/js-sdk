import { FC, useContext, useMemo } from "react";
import { HintIcon, CopyIcon } from "../icons";
import { Input, Text, Numeral, Tooltip, cn, toast } from "@orderly.network/react";
import { ReferralContext } from "../../hooks/referralContext";
import { addQueryParam } from "../../utils/utils";
import { AutoHideText } from "../../components/autoHideText";
import { GradientText } from "../../components/gradientText";
import { useLocalStorage } from "@orderly.network/hooks";
import { API } from "../../types/api";


export const ReferralLink: FC<{ className?: string }> = (props) => {


    const { referralInfo, referralLinkUrl } = useContext(ReferralContext);
    const [pinCodes, setPinCodes] = useLocalStorage<string[]>("orderly_referral_codes", [] as string[]);

    const codes = useMemo((): API.ReferralCode[] => {

        if (!referralInfo?.referrer_info.referral_codes) return [] as (API.ReferralCode[]);
        const referralCodes = [...referralInfo?.referrer_info.referral_codes];

        const pinedItems: API.ReferralCode[] = [];

        for (let i = 0; i < pinCodes.length; i++) {
            const code = pinCodes[i];

            const index = referralCodes.findIndex((item) => item.code === code);
            if (index !== -1) {

                pinedItems.push({ ...referralCodes[index]});
                referralCodes.splice(index, 1);
            }

        }

        return [...pinedItems, ...referralCodes];
    }, [
        referralInfo?.referrer_info.referral_codes,
        pinCodes,
    ]);

    const firstCode = useMemo(() => {
        if (codes.length === 0) {
            return undefined;
        }

        return codes[0];
    }, [codes]);

    const referralLink = useMemo(() => {
        if (!firstCode) return "";

        return addQueryParam(referralLinkUrl, "ref", firstCode.code);

    }, [firstCode]);

    return (
        <div className={cn("orderly-p-6 orderly-outline orderly-outline-1 orderly-outline-base-600 orderly-rounded-lg", props.className)}>
            <div className="orderly-text-base 2xl:orderly-text-lg">
                Referral link
            </div>

            <div className="orderly-mt-4 orderly-flex orderly-flex-col lg:orderly-flex-row orderly-gap-3">

                <div className="lg:orderly-w-auto orderly-flex orderly-gap-3 orderly-items-center">
                    <Info
                        title="Earn"
                        value={firstCode?.referrer_rebate_rate}
                        className="orderly-flex-1"
                        tooltip={<GradientText texts={[
                            { text: `${(firstCode?.referrer_rebate_rate || 0) * 100}%`, gradient: true },
                            { text: " WOOFi Pro net fee that deduct Orderly fee." },
                        ]} />}
                        valueClassName="orderly-bg-gradient-to-r orderly-from-referral-bg-from orderly-to-referral-bg-to orderly-bg-clip-text orderly-text-transparent"
                    />
                    <Info
                        title="Share"
                        value={firstCode?.referee_rebate_rate}
                        className="orderly-flex-1"
                        tooltip={<GradientText texts={[
                            { text: "Your referees get " },
                            { text: `${(firstCode?.referee_rebate_rate || 0) * 100}%`, gradient: true },
                            { text: " of their WOOFi Pro net fee" },
                        ]} />}
                    />
                </div>

                <div className="lg:orderly-flex-1 orderly-flex orderly-flex-col orderly-gap-2">
                    <CopyInfo title="Referral code" value={firstCode?.code || ""} copyText={firstCode?.code || ""} />
                    <CopyInfo title="Referral link" value={(<AutoHideText text={referralLink} />)} copyText={referralLink} />

                </div>

            </div>
        </div>
    );
}

const Info: FC<{
    title: string,
    value: any,
    className?: string,
    tooltip: any,
    valueClassName?: string,
}> = (props) => {

    const { title, value, className, tooltip } = props;

    return (
        <div className={className}>
            <div className={cn("orderly-flex orderly-items-center orderly-text-3xs md:orderly-text-2xs xl:orderly-text-xs")}>
                {title}
                <Tooltip content={tooltip} className="orderly-max-w-[200px]">
                    <div><HintIcon className="orderly-ml-2 orderly-fill-white/40 hover:orderly-fill-white/80 orderly-cursor-pointer" fillOpacity={1} /></div>
                </Tooltip>
            </div>
            <div className={cn("orderly-text-[24px] lg:orderly-text-[26px] 2xl:orderly-text-[28px]", props.valueClassName)}>
                <Numeral rule="percentages" precision={0}>
                    {value}
                </Numeral>

                {/* <GradientText texts={[{ text: value, gradient: gradient }]} /> */}
            </div>
        </div>
    );
}

const CopyInfo: FC<{ title: string, value: string | React.ReactNode, copyText: string }> = (props) => {
    const { title, value, copyText } = props;


    const handleCopy = async (content: string) => {
        try {
            await navigator.clipboard.writeText(content);
            toast.success("Copy success");
        } catch (error) {
            toast.success("Copy failed");
        }
    };

    return (
        <div className="orderly-flex orderly-p-3 orderly-items-center orderly-bg-base-500 orderly-rounded-md orderly-justify-between">
            <div className="orderly-text-base-contrast-54 orderly-text-3xs lg:orderly-text-2xs 2xl:orderly-text-xs">{title}</div>
            <div className="orderly-flex">
                <div className="orderly-flex-1 orderly-max-w-[151px] orderly-mx-3 orderly-text-right orderly-text-xs 2xl:orderly-text-base">{value}</div>
                <CopyIcon
                    fillOpacity={1}
                    className="orderly-mr-3 orderly-cursor-pointer orderly-fill-base-contrast-54 hover:orderly-fill-base-contrast"
                    onClick={() => handleCopy(copyText)}
                />
            </div>
        </div>
    );
}