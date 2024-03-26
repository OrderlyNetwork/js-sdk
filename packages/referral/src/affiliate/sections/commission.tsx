import { useMediaQuery } from "@orderly.network/hooks";
import { Column, Divider, EndReachedBox, ListView, Numeral, Table, cn } from "@orderly.network/react";
import { EmptyView } from "@orderly.network/react";
import { FC, ReactNode, useMemo } from "react";
import { MEDIA_LG, MEDIA_MD } from "../../types/constants";
import { useCommission } from "../../hooks/useCommission";
import { formatTime, formatYMDTime } from "../../utils/utils";

export const CommissionList: FC<{
    dateText?: string,
    setDateText: any
}> = (props) => {
    const { dateText, setDateText } = props;

    const [data, { refresh, isLoading, loadMore }] = useCommission();

    const dataSource = useMemo(() => {
        return data?.filter((item: any) => {
            return item.type === "REFERRAL_REBATE" && item.status === "COMPLETED";
        });
    }, [
        data,
    ]);


    if (dataSource?.length > 0) {
        const text = formatTime(dataSource[0].created_time);
        if (text) {
            setDateText(text);
        }
    } else {
        setDateText(undefined);
    }


    const isMD = useMediaQuery(MEDIA_MD);

    return isMD ?
        <_SmallCommission date={dateText} dataSource={dataSource} loadMore={loadMore} /> :
        <_BigCommission dataSource={dataSource} loadMore={loadMore} />
}

const _SmallCommission: FC<{
    date?: string,
    dataSource: any[],
    loadMore: any
}> = (props) => {
    const { date, dataSource, loadMore } = props;


    const renderItem = (item: any, index: number) => {
        const date = formatYMDTime(item?.created_time);
        const amount = item?.amount;
        const vol = item?.volume;
        return <CommissionCell key={index} date={date || ""} commission={amount} vol={vol} />;
    };


    return (

        <div className="orderly-h-[197px] orderly-overflow-auto">
            {date && <div className="orderly-mt-1 orderly-px-4 orderly-py-2 sm:orderly-flex orderly-items-center md:orderly-hidden md:orderly-h-0 orderly-text-3xs orderly-text-base-contrast-36">{date}</div>}
            <ListView
                dataSource={dataSource}
                loadMore={loadMore}
                renderItem={renderItem}
            />
        </div>
    );
}

const _BigCommission: FC<{
    dataSource: any[]
    loadMore: any
}> = (props) => {
    const { dataSource } = props;

    const columns = useMemo<Column[]>(() => {
        return [
            {
                title: "Date",
                dataIndex: "created_time",
                className: "orderly-h-[52px]",

                render: (value, record) => {
                    const date = formatYMDTime(value);

                    console.log("value", value);


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
                    <Numeral precision={2}>
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
                    <Numeral >
                        {value}
                    </Numeral>
                )
            },
        ];
    }, []);

    return (
        <div className=" orderly-overflow-y-auto orderly-mt-4 orderly-px-3" style={{
            height: `${Math.min(580, Math.max(230, 42 + (dataSource || []).length * 52))}px`
        }}>
            <EndReachedBox onEndReached={props.loadMore}>
                <Table
                    bordered
                    justified
                    showMaskElement={true}
                    columns={columns}
                    dataSource={dataSource}
                    headerClassName="orderly-text-2xs orderly-h-[42px] orderly-text-base-contrast-54 orderly-py-3 orderly-bg-base-900 orderly-sticky orderly-top-0"
                    className={cn(
                        "orderly-text-xs 2xl:orderly-text-base",
                    )}
                    generatedRowKey={(rec, index) => `${index}`}
                />
            </EndReachedBox>
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
        <div className="orderly-my-3 orderly-px-3">
            <div className="orderly-flex orderly-justify-between">
                <div>
                    <div className="orderly-text-3xs orderly-text-base-contrast-36">Date</div>
                    <div className="orderly-mt-1 orderly-text-2xs md:orderly-text-xs orderly-text-base-contrast-80">{date}</div>
                </div>
                <div className="orderly-text-right orderly-flex-1">
                    <div className="orderly-text-3xs orderly-text-base-contrast-36">{`Commission (USDC)`}</div>
                    <Numeral precision={2} className="orderly-mt-1 orderly-text-2xs md:orderly-text-xs orderly-text-base-contrast-80">{commission}</Numeral>
                </div>

                <div className="orderly-text-right orderly-flex-1">
                    <div className="orderly-text-3xs orderly-text-base-contrast-36">{`Referral vol. (USDC)`}</div>
                    <Numeral precision={2} className="orderly-mt-1 orderly-text-2xs md:orderly-text-xs orderly-text-base-contrast-80">{vol}</Numeral>
                </div>
            </div>
            <Divider className="orderly-mt-3" />
        </div>
    );
}