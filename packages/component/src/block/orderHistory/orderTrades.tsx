import { Spinner } from "@/spinner";
import { Numeral } from "@/text";
import { usePrivateQuery, useSymbolsInfo } from "@orderly.network/hooks";
import { Decimal, timestampToString } from "@orderly.network/utils";
import { FC, useMemo } from "react";

export const OrderTrades: FC<{
  record: any;
  index: number;
}> = (props) => {
  const { record, index } = props;
  // const algoOrderId =
  //   "root_algo_order_id" in record
  //     ? record.root_algo_order_id
  //     : record.algo_order_id;

  const algoOrderId = record.algo_order_id;

  const path =
    algoOrderId !== undefined
      ? `/v1/algo/order/${algoOrderId}/trades`
      : `/v1/order/${record.order_id}/trades`;
  const { data } = usePrivateQuery<any[]>(path);
  const base = record?.symbol?.split("_")?.[1] || "";
  const config = useSymbolsInfo();
  const symbolInfo = config ? config?.[record.symbol] : {};
  const baseDp = symbolInfo?.("quote_dp") || 2;

  const body = useMemo(() => {
    if (data === undefined) {
      return (
        <tr>
          <td colSpan={5}>
            <div className="orderly-flex orderly-h-[27.5px]">
              <div className="orderly-flex-1"></div>
              <Spinner size="small" className="orderly-block" />
              <div className="orderly-flex-1"></div>
            </div>
          </td>
        </tr>
      );
    }

    if (data.length === 0) {
      return (
        <tr className="orderly-text-base-contrast-54">
          <td className="orderly-py-1">-</td>
          <td className="orderly-py-1">-</td>
          <td className="orderly-py-1">-</td>
          <td className="orderly-py-1">-</td>
          <td className="orderly-py-1">-</td>
        </tr>
      );
    }

    return data.map((item) => {
      const data = timestampToString(item.executed_timestamp);
      const price = item.executed_price;
      const qty = item.executed_quantity;
      const total = new Decimal(price).mul(qty).toNumber();
      return (
        <tr className="orderly-text-base-contrast-54">
          <td className="orderly-py-1">{item.id}</td>
          <td className="orderly-py-1">{data}</td>
          <td className="orderly-py-1">
            <Numeral precision={baseDp}>{price}</Numeral>
          </td>
          <td className="orderly-py-1">
            <Numeral precision={baseDp}>{qty}</Numeral>
          </td>
          <td className="orderly-py-1">
            <Numeral precision={baseDp}>{total}</Numeral>
          </td>
        </tr>
      );
    });
  }, [data]);

  return (
    <div className="orderly-flex orderly-min-h-[50px] orderly-pb-1 orderly-max-h-[266px] orderly-overflow-auto">
      <table className="orderly-w-full orderly-mx-6 orderly-text-2xs">
        <thead className="orderly-py-2 orderly-text-left orderly-text-base-contrast-36 orderly-sticky">
          <tr className="orderly-bg-base-700">
            <th className="orderly-w-1/5 orderly-pt-2 orderly-bg-base-700 orderly-sticky orderly-top-0">
              Transaction ID
            </th>
            <th className="orderly-w-1/5 orderly-pt-2 orderly-bg-base-700 orderly-sticky orderly-top-0">
              Date
            </th>
            <th className="orderly-w-1/5 orderly-pt-2 orderly-bg-base-700 orderly-sticky orderly-top-0">
              Price (USDC)
            </th>
            <th className="orderly-w-1/5 orderly-pt-2 orderly-bg-base-700 orderly-sticky orderly-top-0">{`Qty (${base})`}</th>
            <th className="orderly-w-1/5 orderly-pt-2 orderly-bg-base-700 orderly-sticky orderly-top-0">
              Total (USDC)
            </th>
          </tr>
        </thead>
        <tbody>{body}</tbody>
      </table>
    </div>
  );
};
