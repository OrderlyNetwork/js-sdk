import { FC, useMemo } from "react";
import { useMediaQuery } from "@orderly.network/hooks";
import {
  Column,
  Divider,
  ListView,
  Numeral,
  Table,
  cn,
} from "@orderly.network/react";
import { RefEmptyView } from "../../components/icons/emptyView";
import { formatYMDTime } from "../../utils/utils";
import { RebatesItem } from "./rebates";

export const RebateList: FC<{
  className?: string;
  dataSource?: RebatesItem[];
  loadMore: any;
  isLoading: boolean;
}> = (props) => {
  const { className, dataSource, loadMore, isLoading } = props;
  const isMD = useMediaQuery("(max-width: 767px)");

  const clsName =
    "orderly-px-3 orderly-overflow-y-auto orderly-max-h-[469px] md:orderly-max-h-[531px] lg:orderly-max-h-[350px] xl:orderly-max-h-[320px] 2xl:orderly-max-h-[340px]";

  const columns = useMemo<Column[]>(() => {
    return [
      {
        title: "Date",
        dataIndex: "date",
        className: "orderly-h-[52px] orderly-px-0 orderly-border-red-300",
        width: 110,
        render: (value, record) => <div>{formatYMDTime(value)}</div>,
      },
      {
        title: "Rebates (USDC)",
        dataIndex: "referee_rebate",
        className: "orderly-h-[52px]",
        align: "right",
        render: (value, record) => (
          <Numeral precision={6} prefix="$">
            {value}
          </Numeral>
        ),
      },
      {
        title: "Trading vol. (USDC)",
        dataIndex: "vol",
        className: "orderly-h-[52px] orderly-px-0",
        align: "right",
        render: (value, record) => (
          <Numeral precision={2} prefix="$">
            {value || 0}
          </Numeral>
        ),
      },
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
          return <SmallCodeCell item={item} />;
        }}
        emptyView={<RefEmptyView />}
      />
    );
  }

  return (
    <div
      className=" orderly-overflow-y-auto orderly-mt-4 orderly-px-2 orderly-relative"
      style={{
        height: `${Math.min(580, Math.max(230, 42 + (dataSource?.length ?? 0) * 52))}px`,
      }}
    >
      <Table
        bordered
        justified
        showMaskElement={false}
        columns={columns}
        dataSource={dataSource}
        headerClassName="orderly-text-2xs orderly-h-[42px] orderly-text-base-contrast-36 orderly-py-3 orderly-bg-base-900 orderly-sticky orderly-top-0 orderly-px-0 orderly-border-[rgba(255,255,255,0.12)]"
        className={cn("orderly-text-xs 2xl:orderly-text-base orderly-px-3")}
        generatedRowKey={(rec, index) => `${index}`}
        // loadMore={() => {
        //     if (!props.isLoading) {
        //         props.loadMore?.();
        //       }
        // }}
        onRow={(rec, index) => {
          return {
            className: "orderly-border-[rgba(255,255,255,0.04)]",
          };
        }}
      />

      {(!props.dataSource || props.dataSource.length <= 0) && (
        <div className="orderly-absolute orderly-top-[42px] orderly-left-0 orderly-right-0 orderly-bottom-0">
          <RefEmptyView />
        </div>
      )}
    </div>
  );
};

const SmallCodeCell: FC<{ item: RebatesItem }> = (props) => {
  const { item } = props;

  return (
    <div>
      <div className="orderly-flex orderly-justify-between orderly-mt-3">
        <div>
          <div className="orderly-text-3xs orderly-text-base-contrast-36">
            Date
          </div>
          <div className="orderly-mt-1 orderly-text-2xs md:orderly-text-xs">
            {formatYMDTime(item.date)}
          </div>
        </div>
        <div className="orderly-text-right orderly-flex-1">
          <div className="orderly-text-3xs orderly-text-base-contrast-36">
            Rebates(USDC)
          </div>
          <Numeral
            prefix="$"
            precision={6}
            className="orderly-mt-1 orderly-text-2xs md:orderly-text-xs"
          >
            {item.referee_rebate}
          </Numeral>
        </div>

        <div className="orderly-text-right orderly-flex-1">
          <div className="orderly-text-3xs orderly-text-base-contrast-36">
            Trading vol. (USDC)
          </div>
          <Numeral
            prefix="$"
            precision={2}
            rule="price"
            className="orderly-mt-1 orderly-text-2xs md:orderly-text-xs"
          >
            {item.vol || 0}
          </Numeral>
        </div>
      </div>
      <Divider className="orderly-my-3" />
    </div>
  );
};
