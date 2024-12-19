import { API } from "@orderly.network/types";
import { Column, Flex, Text } from "@orderly.network/ui";
import { FC, useMemo } from "react";
import {
  SymbolProvider,
  useSymbolContext,
} from "../../../providers/symbolProvider";
import { commifyOptional } from "@orderly.network/utils";

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
            <Text.formatted rule={"date"} formatString="yyyy-MM-dd HH:mm:ss">
              {value}
            </Text.formatted>
          ),
        },
        // Liquidation id
        {
          title: "Liquidation id",
          dataIndex: "liquidation_id",
          width: 202,
          render: (value) => <Text>{value}</Text>,
        },
        // net pnl
        {
          title: "Ins. fund transfer",
          dataIndex: "transfer_amount_to_insurance_fund",
          width: 202,
          render: (value) => {
            return <Text>{commifyOptional(value)}</Text>;
          },
        },
        // Symbol
        {
          title: "Symbol ",
          dataIndex: "Symbol",
          width: 202,
          render: (_: any, record) => (
            <Flex direction={"column"} itemAlign={"start"}>
              {record.positions_by_perp?.map((item) => (
                <Text.formatted rule={"symbol"} formatString="base-quote">{item.symbol}</Text.formatted>
              ))}
            </Flex>
          ),
        },
        // Price (USDC)
        {
          title: "Price (USDC)",
          dataIndex: "Price_(USDC)",
          width: 202,
          render: (_: any, record) => {
            return (
              <Flex direction={"column"} itemAlign={"start"}>
                {record.positions_by_perp?.map((item) => (
                  // <SymbolProvider symbol={item.symbol}>
                  // </SymbolProvider>
                    <FormattedText value={item.transfer_price} type="quote" />
                ))}
              </Flex>
            );
          },
        },
        // Quantity
        {
          title: "Quantity",
          dataIndex: "Quantity",
          width: 202,
          render: (_: any, record) => {
            return (
              <Flex direction={"column"} itemAlign={"start"}>
                {record.positions_by_perp?.map((item) => (
                  // <SymbolProvider symbol={item.symbol}>
                  // </SymbolProvider>
                    <FormattedText value={item.position_qty} type="base" />
                ))}
              </Flex>
            );
          },
        },
        // Liquidation Fee
        {
          title: "Liquidation fee",
          dataIndex: "abs_liquidation_fee",
          width: 202,
          render: (abs_liquidation_fee: any, record) => {
            return (
              <Flex direction={"column"} itemAlign={"start"}>
                {record.positions_by_perp?.map((item) => (
                  // <SymbolProvider symbol={item.symbol}>
                  // </SymbolProvider>
                    <FormattedText value={abs_liquidation_fee} type="quote" />
                ))}
              </Flex>
            );
          },
        },
      ] as Column<API.Liquidation>[],
    []
  );

  return column;
};

const FormattedText: FC<{ value?: string | number; type: "base" | "quote" }> = (
  props
) => {
  // const { quote_dp, base_dp } = useSymbolContext();
  return (
    <Text>
      {commifyOptional(props.value)}
    </Text>
  );
};
