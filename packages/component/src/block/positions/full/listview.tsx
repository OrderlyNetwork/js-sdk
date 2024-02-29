import { Column, Table } from "@/table";
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PositionsViewProps } from "@/block";
import { Numeral, Text } from "@/text";
import {
  PositionsRowProvider,
  usePositionsRowContext,
} from "./positionRowContext";
import { PriceInput } from "./priceInput";
import { CloseButton } from "./closeButton";
import { SymbolProvider } from "@/provider";
import { QuantityInput } from "./quantityInput";
import { NumeralWithCtx } from "@/text/numeralWithCtx";
import { TabContext } from "@/tab";
import { LayoutContext } from "@/layout/layoutContext";
import { useTabContext } from "@/tab/tabContext";
import { Divider } from "@/divider";
import { UnrealizedPnLPopoverCard } from "./unrealPnLHover";
import { API } from "@orderly.network/types";
import { EmptyView } from "@/listView/emptyView";
import { PositionEmptyView } from "./positionEmptyView";
import { SharePnLIcon } from "@/block/shared/sharePnLIcon";

export const Listview: FC<
  PositionsViewProps & {
    unPnlPriceBasis: any;
    setUnPnlPriceBasic: any;
  }
> = (props) => {
  const { height } = useContext(TabContext);
  // const { footerHeight } = useContext(LayoutContext);
  const {
    data: { pnlNotionalDecimalPrecision },
  } = useTabContext();
  const columns = useMemo<Column[]>(() => {
    return [
      {
        title: "Instrument",
        dataIndex: "symbol",
        className: "orderly-h-[48px]",
        fixed: "left",
        width: 120,
        onSort: (r1, r2, sortOrder) => {
          if (sortOrder === "asc") {
            return r1.symbol.localeCompare(r2.symbol);
          }
          return r2.symbol.localeCompare(r1.symbol);
        },
        render: (value: string) => (
          <Text
            rule={"symbol"}
            className="orderly-font-semibold orderly-cursor-pointer"
            onClick={(e) => {
              props.onSymbolChange?.({ symbol: value } as API.Symbol);
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            {value}
          </Text>
        ),
      },
      {
        title: "Quantity",
        className: "orderly-h-[48px]",
        dataIndex: "position_qty",
        onSort: true,
        width: 100,
        render: (value: string) => (
          <NumeralWithCtx
            coloring
            className="orderly-font-semibold"
            tick="base_dp"
          >
            {value}
          </NumeralWithCtx>
        ),
      },
      {
        title: "Avg. open",
        className: "orderly-h-[48px]",
        width: 120,
        onSort: true,
        dataIndex: "average_open_price",
        render: (value: string) => <NumeralWithCtx>{value}</NumeralWithCtx>,
      },
      {
        title: "Mark price",
        dataIndex: "mark_price",
        width: 120,
        onSort: true,
        className: "orderly-h-[48px]",

        render: (value: string) => {
          return (
            <NumeralWithCtx className="orderly-font-semibold">
              {value}
            </NumeralWithCtx>
          );
        },
      },
      {
        title: "Liq. price",
        width: 100,
        onSort: true,
        className: "orderly-h-[48px]",
        hint: "Estimated price at which your position will be liquidated. Prices are estimated and depend on multiple factors across all positions.",
        dataIndex: "est_liq_price",
        render: (value: string) => {
          return Number(value) === 0 ? (
            "--"
          ) : (
            <NumeralWithCtx className="orderly-text-warning orderly-font-semibold">
              {value}
            </NumeralWithCtx>
          );
        },
      },
      {
        title: "Unreal. PnL",
        className: "orderly-h-[48px]",
        dataIndex: "unrealized_pnl",
        width: 120,
        onSort: true,
        hint: (
          <UnrealizedPnLPopoverCard
            unPnlPriceBasis={props.unPnlPriceBasis}
            setUnPnlPriceBasic={props.setUnPnlPriceBasic}
          />
        ),
        render: (value: string, record: any) => {
          return (<span>
            <Numeral
              precision={pnlNotionalDecimalPrecision}
              coloring
              className="orderly-font-semibold"
            >
              {value}
            </Numeral>
            {<Numeral
              rule="percentages"
              precision={pnlNotionalDecimalPrecision}
              coloring
              className="orderly-font-semibold"
              prefix="("
              surfix=")"
            >
              {(record.unsettled_pnl_ROI)}
            </Numeral>}
            <SharePnLIcon className="orderly-ml-2" position={record}/>
          </span>)
        },
      },
      // {
      //   title: "Unreal. ROI",
      //   className: "orderly-h-[48px]",
      //   dataIndex: "unsettled_pnl_ROI",
      //   width: 120,
      //   onSort: true,
      //   render: (value: string) => (

      //   ),
      // },
      // {
      //   title: "Daily real.",
      //   className: "orderly-h-[48px]",
      //   dataIndex: "open_price",
      // },
      {
        title: "Est. total",
        dataIndex: "notional",
        className: "orderly-h-[48px]",
        width: 100,
        onSort: true,
        render: (value: string) => (
          <Numeral
            precision={pnlNotionalDecimalPrecision}
            className="orderly-font-semibold"
          >
            {value}
          </Numeral>
        ),
      },
      {
        title: "Margin",
        className: "orderly-h-[48px]",
        dataIndex: "mm",
        onSort: true,
        width: 100,
        render: (value: string) => (
          <Numeral className="orderly-font-semibold">{value}</Numeral>
        ),
        hint: (
          <div>
            <span>The minimum equity to keep your position. </span>
            <Divider className="orderly-py-2 orderly-border-white/10" />
            <span>Margin = Position size * Mark price * MMR</span>
          </div>
        ),
        hintClassName: "orderly-p-2",
      },
      {
        title: "Qty.",
        dataIndex: "close_qty",
        className: "orderly-h-[48px]",
        width: 100,
        fixed: "right",
        render: (value: string) => {
          return <QuantityInput />;
        },
      },
      {
        title: "Price",
        dataIndex: "close_price",
        width: 100,
        fixed: "right",
        className: "orderly-w-[100px] orderly-h-[48px]",
        render: (value: string) => <PriceInput />,
      },
      {
        title: "",
        dataIndex: "close_position",
        align: "right",
        width: 80,
        fixed: "right",
        className: "orderly-h-[48px]",
        render: (value: string) => {
          return <CloseButton />;
        },
      },
    ];
  }, [pnlNotionalDecimalPrecision, props.unPnlPriceBasis]);

  const divRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={divRef}
      // className="orderly-overflow-y-auto"
      className="orderly-relative"
      style={{ height: `${(height?.content ?? 100) - 68}px` }}
    >
      <Table<API.PositionExt>
        bordered
        justified
        showMaskElement={false}
        columns={columns}
        dataSource={props.dataSource}
        headerClassName="orderly-text-2xs orderly-text-base-contrast-54 orderly-py-3 orderly-bg-base-900"
        className={"orderly-text-2xs orderly-text-base-contrast-80"}
        generatedRowKey={(record) => record.symbol}
        renderRowContainer={(record, index, children) => {
          return (
            <SymbolProvider symbol={record.symbol}>
              <PositionsRowProvider position={record}>
                {children}
              </PositionsRowProvider>
            </SymbolProvider>
          );
        }}
      />

      {(!props.dataSource || props.dataSource.length <= 0) && (
        <PositionEmptyView watchRef={divRef} left={120} right={280} />
      )}
    </div>
  );
};
