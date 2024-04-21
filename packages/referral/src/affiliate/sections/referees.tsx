import { useMediaQuery } from "@orderly.network/hooks";
import { Column, Divider, ListView, Numeral, Table, cn, Text, EndReachedBox, EmptyView, DatePicker } from "@orderly.network/react";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useRefereeInfo } from "../../hooks/useRefereeInfo";
import { formatYMDTime } from "../../utils/utils";
import { API } from "../../types/api";
import { AutoHideText } from "../../components/autoHideText";
import { RefEmptyView } from "../../components/icons/emptyView";
import { useRefereeRebateSummary } from "../../hooks/useRefereeRebateSummary";

export const RefereesList: FC<{
    dateText?: string,
    setDateText: any
}> = (props) => {

    const [data, { loadMore, refresh, isLoading }] = useRefereeInfo({});
    // const [pickDate, setPickDate] = useState({ from: new Date(Date.now() - 86400 * 30), to: new Date() });
    // const { data, mutate: refresh, isLoading } = useRefereeRebateSummary({
    //     startDate: pickDate.from,
    //     endDate: pickDate.to,
    // });

    // const loadMore = () => { };


    const isMD = useMediaQuery("(max-width: 767px)");
    const { dateText, setDateText } = props;


    const dataSource = useMemo(() => {
        if (typeof data === 'undefined') return [];

        // const newData = data.sort((a: any, b: any) => {
        //     return b.code_binding_time - a.code_binding_time;
        // });

        return data;
    }, [data]);

    useEffect(() => {
        if (dataSource?.length > 0) {
            const text = formatYMDTime(dataSource[0].date);
            if (text) {
                setDateText(text + " 00:00:00 UTC");
            }
        } else {
            setDateText(undefined);
        }
    }, [dataSource]);

    return isMD ?
        <_SmallReferees date={dateText} dataSource={dataSource} loadMore={loadMore} isLoading={isLoading} /> :
        <_BigReferees dataSource={dataSource} loadMore={loadMore} isLoading={isLoading}/>
}

const _SmallReferees: FC<{
    date?: string,
    dataSource?: API.RefereeRebateSummary[],
    loadMore: any,
    isLoading: boolean,
}> = (props) => {

    const { date, dataSource, loadMore } = props;

    const renderItem = (item: any, index: number) => {
        const date = formatYMDTime(item?.code_binding_time);
        const addres = item?.user_address;
        const code = item?.referral_code;
        const vol = item?.volume;
        const totalCommission = item?.referral_rebate;
        return <RefereesCell address={addres} code={code} vol={vol} totalCommission={totalCommission} invicationTime={date || ""} />;
    };
    return (

        <div className="orderly-max-h-[431px] orderly-overflow-auto orderly-px-3">
            <div className="orderly-mt-1 orderly-py-2 sm:orderly-flex orderly-items-center md:orderly-hidden orderly-text-3xs orderly-text-base-contrast-36">{date}</div>
            <ListView
                dataSource={dataSource}
                loadMore={loadMore}
                renderItem={renderItem}
                emptyView={<RefEmptyView />}
                contentClassName="orderly-space-y-0"
            />
        </div>
    );
}

const _BigReferees: FC<{
    dataSource: any[],
    loadMore: any,
    isLoading: boolean,
}> = (props) => {
    const { dataSource } = props;

    const columns = useMemo<Column[]>(() => {
        return [
            {
                title: "Referee address",
                dataIndex: "user_address",
                className: "orderly-h-[56px]",
                width: 140,
                render: (value, record) => (
                    <Text rule="address" className="orderly-flex orderly-gap-2 orderly-items-center">
                        {value || "--"}
                    </Text>
                )
            },
            {
                title: "Referral code",
                dataIndex: "referral_code",
                align: "right",
                className: "orderly-h-[56px]",
                render: (value, record) => (
                    <div>
                        {value}
                    </div>
                )
            },
            {
                title: "Total commission (USDC)",
                dataIndex: "referral_rebate",
                className: "orderly-h-[56px]",
                align: "right",
                render: (value, record) => (
                    <Numeral precision={6} prefix="$" >
                        {value}
                    </Numeral>
                )
            },
            {
                title: "Total vol. (USDC)",
                dataIndex: "volume",
                className: "orderly-h-[56px]",
                align: "right",
                render: (value, record) => (
                    <Numeral precision={2} prefix="$" >
                        {value || 0}
                    </Numeral>
                )
            },
            {
                title: "Invication Time",
                dataIndex: "vol",
                className: "orderly-h-[56px]",
                align: "right",
                render: (value, record) => {
                    const date = formatYMDTime(record?.code_binding_time);
                    return <div>{date}</div>
                }
            },
        ];
    }, []);

    return (
        <div className=" orderly-overflow-y-auto orderly-mt-4 orderly-px-3 orderly-relative" style={{
            height: `${Math.min(600, Math.max(230, 42 + (dataSource || []).length * 56))}px`
        }}>
            <Table
                bordered
                justified
                showMaskElement={false}
                columns={columns}
                dataSource={dataSource}
                headerClassName="orderly-text-2xs orderly-h-[42px] orderly-text-base-contrast-54 orderly-py-3 orderly-bg-base-900 orderly-sticky orderly-top-0 orderly-mt-0 orderly-border-[rgba(255,255,255,0.12)]"
                className={cn(
                    "orderly-text-xs 2xl:orderly-text-base orderly-px-3",
                )}
                generatedRowKey={(rec, index) => `${index}`}
                loadMore={() => {
                    if (!props.isLoading) {
                        props.loadMore();
                    }
                }}
                onRow={(rec, index) => {
                    return {
                        className: "orderly-border-[rgba(255,255,255,0.04)]"
                    };
                }}
            />

            {
                (!props.dataSource || props.dataSource.length <= 0) && (
                    <div className="orderly-absolute orderly-top-[42px] orderly-left-0 orderly-right-0 orderly-bottom-0">
                        <RefEmptyView />
                    </div>
                )
            }
        </div>
    );
}

export const RefereesCell: FC<{
    address: string,
    code: string,
    totalCommission: string,
    vol: string,
    invicationTime: string,
}> = (props) => {

    const { address, code, vol, totalCommission, invicationTime } = props;

    const isSM = useMediaQuery("(max-width: 479px)");


    const buildNode = useCallback((
        label: string,
        value: any,
        className?: string,
        rule?: string,
        align?: "left" | "right" | "center",
        flex: boolean = false,
        visibleCount?: number,
        dp?: number,
    ) => {
        const alignClassName = (align === "center") ? "orderly-text-center" : ((align === "right") ? "orderly-text-right" : "orderly-text-left");

        return (
            <div className={cn(" ", className, flex && "orderly-flex orderly-items-center")}>
                <div className={cn("orderly-text-3xs orderly-text-base-contrast-36", alignClassName)}>{label}</div>
                <div className={cn("orderly-mt-1 orderly-text-2xs md:orderly-text-xs orderly-text-base-contrast-80",
                    flex && "orderly-mt-0",
                    alignClassName,
                )}>
                    <div className={cn("orderly-h-[15px] md:orderly-h-[20px] orderly-leading-[15px] md:orderly-leading-[20px]", flex && "orderly-ml-1")}>

                        {rule === "address" ? <AutoHideText text={value} visibleCount={visibleCount} /> : <div>{value}</div>}
                    </div>
                </div>
            </div>
        );
    }, []);

    if (isSM) {
        return <div>
            <div className="orderly-my-3 orderly-grid orderly-gap-3 orderly-grid-cols-2">
                {buildNode("Referee address", address, "orderly-col-span-1", "address", "left", false, 12)}
                {buildNode("Referral code", code, "orderly-col-span-1", "text", "right")}
                {buildNode("Total commission (USDC)", (<Numeral precision={6} prefix="$">{totalCommission}</Numeral>), "orderly-col-span-1", "price")}
                {buildNode("Total vol. (USDC)", (<Numeral precision={6} prefix="$">{vol || 0}</Numeral>), "orderly-col-span-1", "price", "right")}
                {buildNode("Invication time:", invicationTime, "orderly-col-span-2", "text", "left", true)}
            </div>
            <Divider />
        </div>
    }


    return (
        <div className="orderly-pt-4">
            <div className="orderly-flex">
                {buildNode("Referee address", address, "orderly-flex-1", "address", "left", false, 12)}
                {buildNode("Referral code", code, "orderly-w-[90px]", "text", "right")}
                {buildNode("Total commission (USDC)", (<Numeral precision={6} prefix="$">{totalCommission}</Numeral>), "orderly-flex-1", "price", "right")}
            </div>
            <div className="orderly-flex orderly-mt-3">
                {buildNode("Total vol. (USDC)", (<Numeral precision={2} prefix="$">{vol || 0}</Numeral>), "orderly-flex-1", "price",)}
                {buildNode("Invication time", invicationTime, "orderly-w-[90px]", "text", "right")}
                {buildNode("", (<></>), "orderly-flex-1", "price", "right")}

            </div>
            <Divider className="orderly-mt-3 orderly-mb-0 orderly-pb-0" />
        </div>
    );
}