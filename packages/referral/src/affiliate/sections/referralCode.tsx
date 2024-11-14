import { FC, useContext, useMemo } from "react";
import { Button, Column, Divider, Table, cn, modal, toast } from "@orderly.network/react";
import { PinView } from "./pinView";
import { CopyIcon } from "../icons";
import { ReferralContext } from "../../hooks/referralContext";
import { addQueryParam, copyText } from "../../utils/utils";
import { Decimal } from "@orderly.network/utils";
import { useLocalStorage, useMediaQuery, ReferralAPI as API } from "@orderly.network/hooks";
import { EditIcon } from "../../components/icons/edit";
import { EditReferralRate } from "./editReferralRate";
import { RefEmptyView } from "../../components/icons/emptyView";

export type ReferralCodeType = API.ReferralCode & { isPined?: boolean };

export const ReferralCode: FC<{ className?: string }> = (props) => {

    const { referralInfo, referralLinkUrl, mutate } = useContext(ReferralContext);

    const copyLink = (code: string) => {
        copyText(addQueryParam(referralLinkUrl, "ref", code));
    }
    const editRate = (code: ReferralCodeType) => {
        modal.show(EditReferralRate, { code: { ...code }, mutate });
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
        <div className={cn("orderly-pt-4 orderly-px-3 orderly-pb-1 orderly-outline orderly-outline-1 orderly-outline-base-contrast-12 orderly-rounded-xl", props.className)}>
            <div className="orderly-px-3 orderly-flex orderly-items-center orderly-justify-start">
                <div className="orderly-text-base 2xl:orderly-text-lg">Referral codes</div>
                {/* <div className="orderly-flex orderly-text-base-contrast-54 orderly-text-2xs 2xl:orderly-text-xs">
                    Remaining referral codes:&nbsp;
                    <span className="orderly-text-primary-darken">{codes.length}</span>
                </div> */}
            </div>
            <CodeList dataSource={codes} copyLink={copyLink} editRate={editRate} setPinCode={setPinCode} />
        </div>
    );
}

export const CodeList: FC<{
    dataSource: ReferralCodeType[],
    copyLink: (code: string) => void,
    editRate: (item: ReferralCodeType) => void,
    setPinCode: (code: string, del?: boolean) => void,
}> = (props) => {


    const isMD = useMediaQuery("(max-width: 767px)");
    const isXL = useMediaQuery("(min-width: 1024px)");
    const is2XL = useMediaQuery("(min-width: 1440px)");

    
    
 

    const { dataSource, copyLink, editRate } = props;

    const clsName = "orderly-px-3 orderly-overflow-y-auto orderly-max-h-[469px] md:orderly-max-h-[531px] lg:orderly-max-h-[350px] xl:orderly-max-h-[320px] 2xl:orderly-max-h-[340px]";

    const getRate = (item: API.ReferralCode) => {
        const refereeRate = new Decimal(item.referee_rebate_rate).mul(100).toFixed(1, Decimal.ROUND_DOWN).toString();
        const referralRate = new Decimal(item.referrer_rebate_rate).mul(100).toFixed(1, Decimal.ROUND_DOWN).toString();
        return `${referralRate}% / ${refereeRate}%`;
    }

    const getCount = (item: API.ReferralCode) => {
        return `${(item.total_invites)} / ${(item.total_traded)}`;
    }

    const columns = useMemo<Column[]>(() => {
        const action: Column = {
            title: "Actions",
            dataIndex: "",
            className: "orderly-h-[48px] orderly-text-right orderly-w-[90px] 2xl:orderly-w-[120px]",
            align: "right",
            render: (value, record) => (
                <div className="orderly-flex orderly-justify-end">
                    <_CopyLink className="lg:orderly-w-[82px]"
                        onClick={(event) => copyLink(record.code)}
                    />
                </div>
            )
        };
        const cols: Column[] = [
            {
                title: "Referral Codes",
                dataIndex: "code",
                className: "orderly-h-[48px]",
                align: "left",
                render: (value, record) => (
                    <div className="orderly-flex orderly-gap-2 orderly-items-center">
                        <PinView pin={record.isPined || false} onPinChange={(isPinned) => {
                            props.setPinCode(value, !isPinned);
                        }} />
                        <span className="orderly-text-ellipsis overflow-hidden">{value}</span>
                        <CopyIcon
                            fillOpacity={1}
                            className="orderly-mr-3 orderly-cursor-pointer orderly-fill-base-contrast-20 hover:orderly-fill-base-contrast-80"
                            onClick={() => copyText(value)}
                        />
                    </div>
                )
            },
            {
                title: "You / Referee",
                dataIndex: "you-referee",
                className: "orderly-h-[48px] ",
                width: is2XL ? 146 : isXL ?134 : undefined,
                align: "right",
                render: (value, record) => (
                    <div className="orderly-flex orderly-gap-1 orderly-justify-end orderly-items-center">
                        <span>
                            {getRate(record)}
                        </span>
                        <EditIcon
                            onClick={() => editRate(record)}
                            fillOpacity={1}
                            className="orderly-cursor-pointer orderly-fill-base-contrast-20 hover:orderly-fill-base-contrast"
                        />
                    </div>
                )
            },

        ];

        if (is2XL) {
            cols.push(
                {
                    title: "Referees",
                    dataIndex: "referres",
                    className: "orderly-h-[48px]",
                    align: "right",
                    render: (value, record) => (
                        <div >
                            {getCount(record).split("/")?.[0]}
                        </div>
                    )
                }
            );
            cols.push(
                {
                    title: "Traders",
                    dataIndex: "traders",
                    className: "orderly-h-[48px]",
                    align: "right",
                    render: (value, record) => (
                        <div >
                            {getCount(record).split("/")?.[1]}
                        </div>
                    )
                }
            );
        } else {
            cols.push(
                {
                    title: "Referees / Traders",
                    dataIndex: "referees.traders",
                    className: "orderly-h-[48px]",
                    align: "right",
                    width: is2XL ? 137 : isXL ?130 : undefined,
                    render: (value, record) => (
                        <div >
                            {getCount(record)}
                        </div>
                    )
                }
            );
        }

        cols.push(action);

        return cols;
    }, [dataSource, isXL]);

    if (isMD) {
        return <div className={clsName} >
            {(dataSource.map((item, index) => <SmallCodeCell
                code={item.code}
                rate={getRate(item)}
                count={getCount(item)}
                copyLink={() => copyLink(item.code)}
                editRate={() => editRate(item)}
                inPinned={item.isPined}
                setPinCode={props.setPinCode}

            />))}
        </div>;
    }



    return (
        <div className="orderly-h-[340px] orderly-overflow-y-auto orderly-mt-4 orderly-relative">
            <Table
                bordered
                justified
                showMaskElement={false}
                columns={columns}
                dataSource={dataSource}
                headerClassName="orderly-text-2xs orderly-text-base-contrast-54 orderly-py-3 orderly-sticky orderly-top-0 orderly-bg-base-900 orderly-pl-0 orderly-pr-2 orderly-border-[rgba(255,255,255,0.04)]"
                className={cn(
                    "orderly-text-xs 2xl:orderly-text-base orderly-px-3",
                )}
                generatedRowKey={(rec, index) => `${rec.code}${index}`}
                onRow={(rec, index) => {
                    return {
                        className: "orderly-border-[rgba(255,255,255,0.04)]"
                    };
                }}
            />

            {
                (!props.dataSource || props.dataSource.length <= 0) && (
                    <div className="orderly-absolute orderly-top-[48px] orderly-left-0 orderly-right-0 orderly-bottom-0">
                        <RefEmptyView />
                    </div>
                )
            }
        </div>


    );
}


const SmallCodeCell: FC<{
    code: string,
    rate: string,
    count: string,
    copyLink: () => void,
    editRate: () => void,
    inPinned?: boolean,
    setPinCode: (code: string, del?: boolean) => void,
}> = (props) => {
    const { code, rate, count, inPinned } = props;

    return (
        <div>
            <Divider className="orderly-my-3" />
            <div className="orderly-flex orderly-justify-between">
                <div className="orderly-max-w-[94px] md:orderly-max-w-[140px]">
                    <div className="orderly-text-3xs orderly-text-base-contrast-36 orderly-h-[36px] md:orderly-h-fit">Referral Codes</div>
                    <div className="orderly-mt-1 orderly-text-2xs md:orderly-text-xs orderly-flex orderly-gap-2">
                        <div className="orderly-text-ellipsis orderly-flex-1 orderly-overflow-hidden">{code}</div>

                        <button onClick={() => copyText(code)}>
                            <CopyIcon
                                fillOpacity={1}
                                className="orderly-mr-3 orderly-cursor-pointer orderly-fill-base-contrast-54 hover:orderly-fill-base-contrast"
                            />
                        </button>
                    </div>
                </div>
                <div className="orderly-text-right orderly-flex-1">
                    <div className="orderly-text-3xs orderly-text-base-contrast-36 orderly-h-[36px] md:orderly-h-fit">You / Referee</div>
                    <div className="orderly-mt-1 orderly-text-2xs md:orderly-text-xs">{rate}</div>
                </div>

                <div className="orderly-text-right orderly-flex-1">
                    <div className="orderly-text-3xs orderly-text-base-contrast-36 orderly-h-[36px] md:orderly-h-fit">Referees / Traders</div>
                    <div className="orderly-mt-1 orderly-text-2xs md:orderly-text-xs">{count}</div>
                </div>


            </div>
            <div className="orderly-mt-3 orderly-flex orderly-justify-between">
                <PinView pin={inPinned || false} onPinChange={(inPinned) => {
                    props.setPinCode(code, !inPinned);
                }} />
                <div className="orderly-flex orderly-gap-2">

                    <_EditLink
                        onClick={(event) => {
                            props.editRate();
                        }}
                    />
                    <_CopyLink
                        onClick={(event) => {
                            props.copyLink();
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

const _CopyLink: FC<{ onClick: (event: any) => void, className?: string }> = (props) => {

    return (
        <Button
            size="small"
            variant={"outlined"}
            className={cn("orderly-text-primary-darken orderly-border-primary-darken orderly-w-[90px] md:orderly-w-[125px]", props.className)}
            onClick={props.onClick}
        >
            Copy link
        </Button>
    );
}

const _EditLink: FC<{ onClick: (event: any) => void }> = (props) => {

    return (
        <Button
            size="small"
            color={"tertiary"}
            variant={"outlined"}
            className="orderly-w-[90px] md:orderly-w-[125px]"
            onClick={props.onClick}
        >
            Edit
        </Button>
    );
}