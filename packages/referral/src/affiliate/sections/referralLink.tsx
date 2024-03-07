import { FC } from "react";
import { HintIcon } from "../icons/hint";
import { Input, Numeral } from "@orderly.network/react";

export const ReferralLink = () => {

    return (
        <div className="orderly-p-6 orderly-outline orderly-outline-1 orderly-outline-base-600">
            <div className="orderly-text-base 2xl:orderly-text-lg">
                Referral link
            </div>

            <div className="orderly-flex orderly-items-center">
                <Info title="Earn" value={"0"} />
                <Info title="Share" value={"0"} />
            </div>

            <div>
                
                <Input />
                <Input />
            </div>
        </div>
    );
}

const Info: FC<{title: string, value: any}> = (props) => {

    const { title, value } = props;

    return (
        <div>
            <div className="orderly-flex orderly-items-center orderly-text-3xs md:orderly-text-2xs xl:orderly-text-xs">
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