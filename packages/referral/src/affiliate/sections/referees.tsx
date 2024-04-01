import { useMediaQuery } from "@orderly.network/hooks";
import { Column, Divider, ListView, Numeral, Statistic, Table, cn, Text, EndReachedBox, EmptyView } from "@orderly.network/react";
import { FC, useCallback, useMemo } from "react";
import { MEDIA_LG, MEDIA_MD, MEDIA_SM } from "../../types/constants";
import { useRefereeInfo } from "../../hooks/useRefereeInfo";
import { formatTime, formatYMDTime, parseTime } from "../../utils/utils";
import { API } from "../../types/api";
import { AutoHideText } from "../../components/autoHideText";

export const RefereesList: FC<{
    dateText?: string,
    setDateText: any
}> = (props) => {

    const [data, { loadMore, refresh, isLoading }] = useRefereeInfo({});

    const isMD = useMediaQuery(MEDIA_MD);
    const { dateText, setDateText } = props;

    const dataSource = useMemo(() => {
        if (!data) return null;

       const newData = data.sort((a: any, b: any) => {
            return b.code_binding_time - a.code_binding_time;
        });

        return newData;
    }, [data]);

    if (dataSource?.length > 0) {
        const text = formatYMDTime(dataSource[0].code_binding_time);
        if (text) {
            setDateText(text + " 00:00:00 UTC");
        }
    }

    return isMD ?
        <_SmallReferees date={dateText} dataSource={dataSource} loadMore={loadMore} /> :
        <_BigReferees dataSource={dataSource} loadMore={loadMore} />
}

const _SmallReferees: FC<{
    date?: string,
    dataSource?: API.RefereeInfoItem[],
    loadMore: any,
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

        <div className="orderly-h-[197px] orderly-overflow-auto">
            <div className="orderly-mt-1 orderly-px-4 orderly-py-2 sm:orderly-flex orderly-items-center md:orderly-hidden orderly-text-3xs orderly-text-base-contrast-36">{date}</div>
            <ListView
                dataSource={dataSource}
                loadMore={loadMore}
                renderItem={renderItem}
            />
        </div>
    );
}

const _BigReferees: FC<{
    dataSource: any[],
    loadMore: any,
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
                    <Numeral precision={2} >
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
                    <Numeral precision={2} >
                        {value}
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
            <EndReachedBox onEndReached={props.loadMore}>
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
                />
            </EndReachedBox>

            {
                (!props.dataSource || props.dataSource.length <= 0) && (
                    <div className="orderly-absolute orderly-top-[42px] orderly-left-0 orderly-right-0 orderly-bottom-0">
                        <EmptyView />
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

    const isSM = useMediaQuery(MEDIA_SM);

    console.log("ssss is SM", isSM);

    const buildNode = useCallback((
        label: string,
        value: any,
        className?: string,
        rule?: string,
        align?: "left" | "right" | "center"
    ) => {

        return (
            <Statistic
                label={label}
                labelClassName="orderly-text-3xs orderly-text-base-contrast-36"
                value={(<AutoHideText text={value} />)}
                valueClassName="orderly-mt-1 orderly-text-2xs md:orderly-text-xs orderly-text-base-contrast-80"
                rule={rule}
                className={className}
                align={align}
            />
        );
    }, []);

    if (isSM) {
        return <div className="orderly-my-3 orderly-px-4 orderly-grid orderly-gap-2 orderly-grid-cols-2">
            {buildNode("Referee address", address, "orderly-col-span-1", "text")}
            {buildNode("Referee code", code, "orderly-col-span-1", "text", "right")}
            {buildNode("Total commission (USDC)", totalCommission, "orderly-col-span-1", "price")}
            {buildNode("Total vol. (USDC)", vol, "orderly-col-span-1", "price", "right")}
            {buildNode("Invication time", invicationTime, "orderly-col-span-1", "text")}
        </div>
    }


    return (
        <div className="orderly-my-3 orderly-px-4">
            <div className="orderly-flex">
                {buildNode("Referee address", address, "orderly-w-[159px]", "text")}
                {buildNode("Referee code", code, "orderly-flex-1", "text", "right")}
                {buildNode("Total commission (USDC)", totalCommission, "orderly-w-[159px]", "price", "right")}
            </div>
            <div className="orderly-flex orderly-mt-3">
                {buildNode("Total vol. (USDC)", vol, "orderly-w-[159px]", "price",)}
                {buildNode("Invication time", invicationTime, "orderly-col-span-1", "text", "right")}
            </div>
            <Divider className="orderly-mt-3" />
        </div>
    );
}