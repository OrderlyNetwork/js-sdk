import { useMediaQuery } from "@orderly.network/hooks";
import { Column, Divider, EndReachedBox, ListView, Numeral, Table, cn } from "@orderly.network/react";
import { EmptyView } from "@orderly.network/react";
import { FC, ReactNode, useMemo } from "react";
import { MEDIA_LG, MEDIA_MD } from "../../types/constants";
import { useCommission } from "../../hooks/useCommission";
import { formatTime, formatYMDTime } from "../../utils/utils";
import { refCommify } from "../../utils/decimal";
import { RefEmptyView } from "../../components/icons/emptyView";


export const CommissionList: FC<{
    dateText?: string,
    setDateText: any
}> = (props) => {
    const { dateText, setDateText } = props;

    const [data, { refresh, isLoading, loadMore }] = useCommission();


    const dataSource = useMemo(() => {
        return data?.filter((item: any) => {
            return item.type === "REFERRER_REBATE" && item.status === "COMPLETED";
        }).sort((a: any, b: any) => b.created_time - a.created_time);
    }, [
        data,
    ]);


    if (dataSource?.length > 0) {
        const text = formatYMDTime(dataSource[0].created_time);
        if (text) {
            setDateText(text + " 00:00:00 UTC");
        }
    } else {
        setDateText(undefined);
    }


    const isMD = useMediaQuery(MEDIA_MD);

    return isMD ?
        <_SmallCommission date={dateText} dataSource={dataSource} loadMore={loadMore} isLoading={isLoading} /> :
        <_BigCommission dataSource={dataSource} loadMore={loadMore} isLoading={isLoading} />
}

const _SmallCommission: FC<{
    date?: string,
    dataSource: any[],
    loadMore: any,
    isLoading: boolean,
}> = (props) => {
    const { date, dataSource, loadMore, isLoading } = props;


    const renderItem = (item: any, index: number) => {
        const date = formatYMDTime(item?.created_time);
        const amount = item?.amount;
        const vol = item?.volume;
        return <CommissionCell key={index} date={date || ""} commission={amount} vol={vol} />;
    };


    return (

        <div className="orderly-max-h-[431px] orderly-overflow-auto">
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
                dataIndex: "created_time",
                className: "orderly-h-[52px]",
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
                dataIndex: "amount",
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
        <div className="orderly-mt-4 orderly-px-3 orderly-relative" style={{
            height: `${Math.min(580, Math.max(230, 42 + (dataSource || []).length * 52))}px`
        }}>
            <Table
                bordered
                justified
                showMaskElement={false}
                columns={columns}
                dataSource={dataSource}
                headerClassName="orderly-text-2xs orderly-h-[42px] orderly-text-base-contrast-54 orderly-py-3 orderly-bg-base-900 orderly-sticky orderly-top-0"
                className={cn(
                    "orderly-text-xs 2xl:orderly-text-base",
                )}
                generatedRowKey={(rec, index) => `${index}`}
                scrollToEnd={() => {
                    console.log("scroll to end");

                    if (!props.isLoading) {
                        props.loadMore();
                    }
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