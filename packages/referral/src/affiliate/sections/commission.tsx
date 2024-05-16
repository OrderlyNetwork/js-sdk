import { useMediaQuery, useCommission, useReferralRebateSummary } from "@orderly.network/hooks";
import { Column, DatePicker, Divider, EndReachedBox, ListView, Numeral, Table, cn, format, subDays } from "@orderly.network/react";
import { FC, useEffect, useMemo, useState } from "react";

import { formatYMDTime } from "../../utils/utils";
import { RefEmptyView } from "../../components/icons/emptyView";
import { DateRange } from "../../../../component/esm";


export const CommissionList: FC<{
    dateText?: string,
    setDateText: any
}> = (props) => {
    const { dateText, setDateText } = props;

    const [pickDate, setPickDate] = useState<DateRange | undefined>({ from: subDays(new Date(), 91), to: subDays(new Date(), 1) });
    const [data, { refresh, isLoading, loadMore }] = useReferralRebateSummary({
        startDate: pickDate?.from !== undefined ? format(pickDate.from, 'yyyy-MM-dd') : undefined,
        endDate: pickDate?.to !== undefined ? format(pickDate.to, 'yyyy-MM-dd') : undefined,
    });

    // const loadMore = () => {};

    useEffect(() => {
        refresh();
    }, [pickDate]);


    const dataSource = useMemo(() => {
        // return data?.filter((item: any) => {
        //     return item.type === "REFERRER_REBATE" && item.status === "COMPLETED";
        // }).sort((a: any, b: any) => b.created_time - a.created_time);

        return data;
    }, [
        data,
    ]);


    useEffect(() => {

        if (dataSource?.length > 0) {
            const text = formatYMDTime(dataSource[0].created_time);
            if (text) {
                setDateText(text + " 00:00:00 UTC");
            }
        } else {
            setDateText(undefined);
        }

    }, [dataSource]);


    const isMD = useMediaQuery("(max-width: 767px)");

    return <>
    <DatePicker
                onDateUpdate={(date) => {
                    if (typeof date?.from === 'undefined') {
                        setPickDate(undefined);
                        return;
                    }

                    setPickDate((pre) => ({
                        from: date.from,
                        to: date.to
                    }));
                }}
                initDate={pickDate}
                triggerClassName="orderly-rounded-sm orderly-justify-between orderly-w-fit"
                numberOfMonths={isMD ? 1 : 2}
                className="orderly-ml-4 lg:orderly-flex-row orderly-mt-3"
                classNames={{
                    months: "orderly-flex orderly-flex-col lg:orderly-flex-row orderly-gap-5"
                }}
                disabled={{
                    after: subDays(new Date(), 1)
                }}
                required
            />
    {isMD ?
        <_SmallCommission date={dateText} dataSource={dataSource} loadMore={loadMore} isLoading={isLoading} /> :
        <_BigCommission dataSource={dataSource} loadMore={loadMore} isLoading={isLoading} />}
    </>
}

const _SmallCommission: FC<{
    date?: string,
    dataSource: any[],
    loadMore: any,
    isLoading: boolean,
}> = (props) => {
    const { date, dataSource, loadMore, isLoading } = props;


    const renderItem = (item: any, index: number) => {
        const date = item.date;;
        const amount = item?.referral_rebate;
        const vol = item?.volume;
        return <CommissionCell key={index} date={date || ""} commission={amount} vol={vol} />;
    };


    return (

        <div className="orderly-px-3 orderly-max-h-[431px] orderly-overflow-auto">
            {date && <div className="orderly-mt-1 orderly-px-0 orderly-py-2 sm:orderly-flex orderly-items-center md:orderly-hidden md:orderly-h-0 orderly-text-3xs orderly-text-base-contrast-36">{date}</div>}
            <ListView
                dataSource={dataSource}
                loadMore={loadMore}
                isLoading={isLoading}
                renderItem={renderItem}
                emptyView={<RefEmptyView />}
            />
        </div>
    );
}

const _BigCommission: FC<{
    dataSource: any[]
    loadMore: any,
    isLoading: boolean,
}> = (props) => {
    const { dataSource } = props;

    const columns = useMemo<Column[]>(() => {
        return [
            {
                title: "Date",
                dataIndex: "date",
                className: "orderly-h-[52px] orderly-px-1",
                width: 110,
                render: (value, record) => {
                    const date = formatYMDTime(value);

                    return (
                        <div className="orderly-flex orderly-gap-2 orderly-items-center">
                            {date}
                        </div>
                    );
                }
            },
            {
                title: "Commission (USDC)",
                dataIndex: "referral_rebate",
                align: "right",
                className: "orderly-h-[52px]",
                render: (value, record) => (
                    <Numeral precision={6} prefix="$">
                        {value}
                    </Numeral>
                )
            },
            {
                title: "Referral vol. (USDC)",
                dataIndex: "volume",
                className: "orderly-h-[52px]",
                align: "right",
                render: (value, record) => (
                    <Numeral precision={2} prefix="$">
                        {value || 0}
                    </Numeral>
                )
            },
        ];
    }, []);


    return (
        <div className="orderly-mt-4 orderly-relative orderly-px-3" style={{
            height: `${Math.min(580, Math.max(230, 42 + (dataSource || []).length * 52))}px`
        }}>
            <Table
                bordered
                justified
                showMaskElement={false}
                columns={columns}
                dataSource={dataSource}
                headerClassName="orderly-text-2xs orderly-h-[42px] orderly-text-base-contrast-54 orderly-py-3 orderly-bg-base-900 orderly-sticky orderly-top-0 orderly-px-1 orderly-border-[rgba(255,255,255,0.12)]"
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
                        <RefEmptyView  iconSize={62}/>
                    </div>
                )
            }
        </div>
    );
}

export const CommissionCell: FC<{
    date: string,
    commission: string,
    vol: string,
}> = (props) => {

    const { date, commission, vol } = props;

    return (
        <div className="orderly-my-3" style={{letterSpacing: "0px"}}>
            <div className="orderly-flex orderly-justify-between">
                <div>
                    <div className="orderly-text-3xs orderly-text-base-contrast-36">Date</div>
                    <div className="orderly-mt-1 orderly-text-2xs md:orderly-text-xs orderly-text-base-contrast-80">{date}</div>
                </div>
                <div className="orderly-text-right orderly-flex-1">
                    <div className="orderly-text-3xs orderly-text-base-contrast-36">{`Commission (USDC)`}</div>
                    <Numeral precision={6} prefix="$" className="orderly-mt-1 orderly-text-2xs md:orderly-text-xs orderly-text-base-contrast-80">{commission}</Numeral>
                </div>

                <div className="orderly-text-right orderly-flex-1">
                    <div className="orderly-text-3xs orderly-text-base-contrast-36">{`Referral vol. (USDC)`}</div>
                    <Numeral precision={2} prefix="$" className="orderly-mt-1 orderly-text-2xs md:orderly-text-xs orderly-text-base-contrast-80">{vol || 0}</Numeral>
                </div>
            </div>
            <Divider className="orderly-mt-3" />
        </div>
    );
}