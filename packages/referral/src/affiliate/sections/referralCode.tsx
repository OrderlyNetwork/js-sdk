import { FC, useContext, useMemo } from "react";
import { MEDIA_MD } from "../../types/constants";
import { Button, Column, Divider, Table, cn, toast } from "@orderly.network/react";
import { PinView } from "./pinView";
import { CopyIcon } from "../icons";
import { ReferralContext } from "../../hooks/referralContext";
import { API } from "../../types/api";
import { addQueryParam, copyText } from "../../utils/utils";
import { Decimal } from "@orderly.network/utils";
import { useLocalStorage, useMediaQuery } from "@orderly.network/hooks";

type ReferralCodeType = API.ReferralCode & { isPined?: boolean };

export const ReferralCode: FC<{ className?: string }> = (props) => {

    const { referralInfo, referralLinkUrl } = useContext(ReferralContext);

    const copyLink = (code: string) => {
        copyText(addQueryParam(referralLinkUrl, "ref", code));
    }


    const [pinCodes, setPinCodes] = useLocalStorage<string[]>("orderly_referral_codes", [] as string[]);
    const setPinCode = (code: string, del?: boolean) => {

        if (del) {
            const index = pinCodes.findIndex((item: string) => item === code);
            if (index !== -1) {
                pinCodes.splice(index, 1);
            }
        } else {
            (pinCodes).splice(0, 0, code);
        }


        if (pinCodes.length > 6) {
            pinCodes.splice(pinCodes.length - 1, 1);
        }

        setPinCodes([...pinCodes]);
    }

    const codes = useMemo((): ReferralCodeType[] => {

        if (!referralInfo?.referrer_info.referral_codes) return [] as (ReferralCodeType[]);
        const referralCodes = [...referralInfo?.referrer_info.referral_codes];

        const pinedItems: ReferralCodeType[] = [];

        for (let i = 0; i < pinCodes.length; i++) {
            const code = pinCodes[i];

            const index = referralCodes.findIndex((item) => item.code === code);
            if (index !== -1) {

                pinedItems.push({ ...referralCodes[index], isPined: true });
                referralCodes.splice(index, 1);
            }

        }

        return [...pinedItems, ...referralCodes];
    }, [
        referralInfo?.referrer_info.referral_codes,
        pinCodes,
    ]);

    return (
        <div className={cn("orderly-px-6 orderly-pt-6 orderly-pb-1 orderly-outline orderly-outline-1 orderly-outline-base-600 orderly-rounded-lg", props.className)}>
            <div className="orderly-flex orderly-items-center orderly-justify-start">
                <div className="orderly-text-base 2xl:orderly-text-lg">Referral codes</div>
                {/* <div className="orderly-flex orderly-text-base-contrast-54 orderly-text-2xs 2xl:orderly-text-xs">
                    Remaining referral codes:&nbsp;
                    <span className="orderly-text-primary">{codes.length}</span>
                </div> */}
            </div>
            <CodeList dataSource={codes} copyLink={copyLink} setPinCode={setPinCode} />
        </div>
    );
}

export const CodeList: FC<{
    dataSource: ReferralCodeType[],
    copyLink: (code: string) => void,
    setPinCode: (code: string, del?: boolean) => void,
}> = (props) => {


    const isMD = useMediaQuery(MEDIA_MD);
    const { dataSource, copyLink } = props;

    const clsName = "orderly-overflow-y-auto orderly-max-h-[469px] md:orderly-max-h-[531px] lg:orderly-max-h-[350px] xl:orderly-max-h-[320px] 2xl:orderly-max-h-[340px]";

    const getRate = (item: API.ReferralCode) => {
        const refereeRate = new Decimal((item.referee_rebate_rate * 100)).toFixed(1, Decimal.ROUND_DOWN);
        const referralRate = new Decimal((item.referrer_rebate_rate * 100)).toFixed(1, Decimal.ROUND_DOWN);
        return `${refereeRate}% / ${referralRate}%`;
    }

    const getCount = (item: API.ReferralCode) => {
        return `${item.total_invites} / ${item.total_traded}`;
    }

    const columns = useMemo<Column[]>(() => {
        return [
            {
                title: "Referral Codes",
                dataIndex: "code",
                className: "orderly-h-[44px]",

                render: (value, record) => (
                    <div className="orderly-flex orderly-gap-2 orderly-items-center">
                        <PinView pin={record.isPined || false} onPinChange={(isPinned) => {
                            props.setPinCode(value, !isPinned);
                        }} />
                        <div>{value}</div>
                        <CopyIcon
                            className="orderly-mr-3 orderly-cursor-pointer"
                            onClick={() => copyText(value)}
                        />
                    </div>
                )
            },
            {
                title: "You / Referee",
                dataIndex: "referees",
                className: "orderly-h-[44px]",
                render: (value, record) => (
                    <div>
                        {getRate(record)}
                    </div>
                )
            },
            {
                title: "Referees / Traders",
                dataIndex: "referees",
                className: "orderly-h-[44px]",
                align: "right",
                render: (value, record) => (
                    <div >
                        {getCount(record)}
                    </div>
                )
            },
            {
                title: "Actions",
                dataIndex: "referees",
                className: "orderly-h-[44px] orderly-text-right",
                align: "right",
                render: (value, record) => (
                    <div className="orderly-flex orderly-justify-end">
                        <_CopyLink
                            onClick={(event) => copyText(value)}
                        />
                    </div>
                )
            },
        ];
    }, [dataSource]);



    if (isMD) {
        return <div className={clsName} >
            {(dataSource.map((item, index) => <SmallCodeCell
                code={item.code}
                rate={getRate(item)}
                count={getCount(item)}
                copyLink={copyLink}
                inPinned={item.isPined}
                setPinCode={props.setPinCode}
            />))}
        </div>;
    }



    return (
        <div className="orderly-h-[300px] orderly-overflow-y-auto orderly-mt-4">
            <Table
                bordered
                justified
                showMaskElement={false}
                columns={columns}
                dataSource={dataSource}
                headerClassName="orderly-text-2xs orderly-text-base-contrast-54 orderly-py-3 orderly-bg-base-900 orderly-sticky orderly-top-0"
                className={cn(
                    "orderly-text-xs 2xl:orderly-text-base",
                )}
                generatedRowKey={(rec, index) => `${index}`}
            />
        </div>


    );
}


const SmallCodeCell: FC<{
    code: string,
    rate: string,
    count: string,
    copyLink: (code: string) => void,
    inPinned?: boolean,
    setPinCode: (code: string, del?: boolean) => void,
}> = (props) => {
    const { code, rate, count, inPinned } = props;

    return (
        <div>
            <Divider className="orderly-my-3" />
            <div className="orderly-flex orderly-justify-between">
                <div>
                    <div className="orderly-text-3xs orderly-text-base-contrast-36">Referral Codes</div>
                    <div className="orderly-mt-1 orderly-text-2xs md:orderly-text-xs orderly-flex orderly-gap-2">
                        <div>{code}</div>

                        <CopyIcon
                            fillOpacity={1}
                            className="orderly-mr-3 orderly-cursor-pointer orderly-fill-base-contrast-54 hover:orderly-fill-base-contrast"
                            onClick={() => copyText(code)}
                        />
                    </div>
                </div>
                <div className="orderly-text-right orderly-flex-1">
                    <div className="orderly-text-3xs orderly-text-base-contrast-36">You / Referee</div>
                    <div className="orderly-mt-1 orderly-text-2xs md:orderly-text-xs">{rate}</div>
                </div>

                <div className="orderly-text-right orderly-flex-1">
                    <div className="orderly-text-3xs orderly-text-base-contrast-36">Referees / Traders</div>
                    <div className="orderly-mt-1 orderly-text-2xs md:orderly-text-xs">{count}</div>
                </div>


            </div>
            <div className="orderly-mt-3 orderly-flex orderly-justify-between">
                <PinView pin={inPinned || false} onPinChange={(inPinned) => {
                    props.setPinCode(code, !inPinned);
                }} />
                <_CopyLink
                    onClick={(event) => {
                        props.copyLink(code);
                    }}
                />
            </div>
        </div>
    );
}

const _CopyLink: FC<{ onClick: (event: any) => void }> = (props) => {

    return (
        <Button
            size="small"
            variant={"outlined"}
            className="orderly-text-primary orderly-border-primary"
            onClick={props.onClick}
        >
            Copy link
        </Button>
    );
}