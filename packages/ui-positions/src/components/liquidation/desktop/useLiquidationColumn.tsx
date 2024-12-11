import { API } from "@orderly.network/types";
import {
  Column,
  Flex,
  Text,
} from "@orderly.network/ui";
import { useMemo } from "react";

export const useLiquidationColumn = (props: {}) => {
  const {} = props;

  const column = useMemo(
    () =>
      [
        // Time
        {
          title: "Time",
          dataIndex: "timestamp",
          fixed: "left",
          width: 202,
          render: (value: string) => (
            <Text.formatted rule={"date"} formatString="yyyy-MM-dd hh:mm:ss">
              {value}
            </Text.formatted>
          ),
        },
        // Liquidation id
        {
          title: "Liquidation id",
          dataIndex: "liquidation_id",
          width: 202,
          render: (value) => (<Text>{value}</Text>)
        },
        // net pnl
        {
          title: "Ins. fund transfer",
          dataIndex: "transfer_amount_to_insurance_fund",
          width: 202,
        },
        // Instrument
        {
          title: "Instrument ",
          dataIndex: "Instrument",
          width: 202,
          render: (_: any, record) => (
            <Flex direction={"column"} itemAlign={"start"}>
              {record.positions_by_perp?.map((item) => (
                <Text>{item.symbol}</Text>
              ))}
            </Flex>
          ),
        },
        // Price (USDC)
        {
          title: "Price (USDC)",
          dataIndex: "Price_(USDC)",
          width: 202,
          render: (_: any, record) => (
            <Flex direction={"column"} itemAlign={"start"}>
              {record.positions_by_perp?.map((item) => (
                <Text>{item.transfer_price}</Text>
              ))}
            </Flex>
          ),
        },
        // Quantity
        {
          title: "Quantity",
          dataIndex: "Quantity",
          width: 202,
          render: (_: any, record) => (
            <Flex direction={"column"} itemAlign={"start"}>
              {record.positions_by_perp?.map((item) => (
                <Text>{item.position_qty}</Text>
              ))}
            </Flex>
          ),
        },
        // Liquidation Fee
        {
          title: "Liquidation Fee",
          dataIndex: "Liquidation_Fee",
          width: 202,
          render: (_: any, record) => (
            <Flex direction={"column"} itemAlign={"start"}>
              {record.positions_by_perp?.map((item) => (
                <Text>{item.liquidator_fee}</Text>
              ))}
            </Flex>
          ),
        },
      ] as Column<API.Liquidation>[],
    []
  );

  return column;
};
