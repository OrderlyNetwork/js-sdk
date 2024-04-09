import { useMediaQuery } from "@orderly.network/hooks";
import { Column, Divider, EmptyView, EndReachedBox, ListView, Numeral, Table, cn } from "@orderly.network/react";
import { FC, useMemo } from "react";
import { MEDIA_MD } from "../../types/constants";
import { RebatesItem } from "./rebates";
import { formatYMDTime } from "../../utils/utils";
import { commify } from "@orderly.network/utils";
import { refCommify } from "../../utils/decimal";
import { RefEmptyView } from "../../components/icons/emptyView";

export const RebateList: FC<{
    className?: string,
    dataSource?: RebatesItem[],
    loadMore: any,
    isLoading: boolean,
}> = (props) => {

    const { className, dataSource, loadMore, isLoading } = props;
    const isMD = useMediaQuery(MEDIA_MD);

    const clsName = "orderly-overflow-y-auto orderly-max-h-[469px] md:orderly-max-h-[531px] lg:orderly-max-h-[350px] xl:orderly-max-h-[320px] 2xl:orderly-max-h-[340px]";

    const columns = useMemo<Column[]>(() => {
        return [
            {
                title: "Date",
                dataIndex: "created_time",
                className: "orderly-h-[52px]",
                width: 110,
                render: (value, record) => (
                    <div>
                        {formatYMDTime(value)}
                    </div>
                )
            },
            {
                title: "Rebates (USDC)",
                dataIndex: "amount",
                className: "orderly-h-[52px]",
                align: "right",
                render: (value, record) => (
                    <Numeral precision={6} prefix="$">
                        {value}
                    </Numeral>
                )
            },
            {
                title: "Trading vol. (USDC)",
                dataIndex: "vol",
                className: "orderly-h-[52px]",
                align: "right",
                render: (value, record) => (
                    <Numeral precision={2} prefix="$">
                        {value || 0}
                    </Numeral>
                )
            }
        ];
    }, []);

    if (isMD) {
        return (
            <ListView
                className={clsName}
                loadMore={loadMore}
                isLoading={isLoading}
                dataSource={dataSource}
                renderItem={(item, index) => {
                    return <SmallCodeCell item={item} />
                }}
                emptyView={<RefEmptyView />}
            />);
    }



    return (
        <div className=" orderly-overflow-y-auto orderly-mt-4 orderly-px-3 orderly-relative" style={{
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
                    if (!props.isLoading) {
                        props.loadMore?.();
                      }
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


const SmallCodeCell: FC<{ item: RebatesItem }> = (props) => {
    const { item } = props;

    return (
        <div>

            <div className="orderly-flex orderly-justify-between orderly-mt-3">
                <div>
                    <div className="orderly-text-3xs orderly-text-base-contrast-36">Date</div>
                    <div className="orderly-mt-1 orderly-text-2xs md:orderly-text-xs">{formatYMDTime(item.created_time)}</div>
                </div>
                <div className="orderly-text-right orderly-flex-1">
                    <div className="orderly-text-3xs orderly-text-base-contrast-36">Rebates(USDC)</div>
                    <Numeral prefix="$" precision={6} className="orderly-mt-1 orderly-text-2xs md:orderly-text-xs">{item.amount}</Numeral>
                </div>

                <div className="orderly-text-right orderly-flex-1">
                    <div className="orderly-text-3xs orderly-text-base-contrast-36">Trading vol. (USDC)</div>
                    <Numeral prefix="$" precision={2} rule="price" className="orderly-mt-1 orderly-text-2xs md:orderly-text-xs">{item.vol || 0}</Numeral>
                </div>


            </div>
            <Divider className="orderly-my-3" />
        </div>
    );
}