import React from "react";
import { Button, Flex, Text, TokenIcon } from "@orderly.network/ui";
import type { Column } from "@orderly.network/ui";
import type { ConvertRecord, ConvertTransaction } from "./type";

export interface ConvertColumnsOptions {
  onDetailsClick?: (convertId: number) => void;
}

export interface ConvertDetailColumnsOptions {
  onTxClick?: (txId: string) => void;
}

export const useConvertColumns = (options: ConvertColumnsOptions) => {
  const { onDetailsClick } = options;

  const columns = React.useMemo<Column[]>(() => {
    return [
      {
        title: "Converted Asset",
        dataIndex: "converted_asset",
        align: "left",
        width: 150,
        render(convertedAssets: Record<string, number>) {
          const assets = Object.keys(convertedAssets);
          if (assets.length === 1) {
            return (
              <Flex itemAlign="center" gap={2}>
                <TokenIcon name={assets[0]} />
                {assets[0]}
              </Flex>
            );
          }
          return (
            <Flex itemAlign="center" gap={2}>
              <Text>{assets.length} Assets</Text>
            </Flex>
          );
        },
      },
      {
        title: "USDC Amount",
        dataIndex: "received_qty",
        align: "left",
        width: 120,
        render(qty: number, record: ConvertRecord) {
          return (
            <Text.numeral dp={2} currency="$">
              {qty}
            </Text.numeral>
          );
        },
      },
      {
        title: "Fee",
        dataIndex: "details",
        align: "left",
        width: 100,
        render(details: ConvertRecord["details"]) {
          const totalHaircut = details.reduce(
            (sum, detail) => sum + detail.haircut,
            0,
          );
          return (
            <Text.numeral dp={4} coloring showIdentifier>
              {totalHaircut}
            </Text.numeral>
          );
        },
      },
      {
        title: "Type",
        dataIndex: "type",
        align: "left",
        width: 80,
        render(type: string) {
          return <Text>{type.toUpperCase()}</Text>;
        },
      },
      {
        title: "Convert ID",
        dataIndex: "convert_id",
        align: "left",
        width: 100,
      },
      {
        title: "Time",
        dataIndex: "created_time",
        align: "left",
        width: 120,
        rule: "date",
      },
      {
        title: "Status",
        dataIndex: "status",
        align: "left",
        width: 100,
        render(status: string) {
          return <Text>{status}</Text>;
        },
      },
      {
        title: null,
        dataIndex: "convert_id",
        align: "center",
        width: 80,
        render(convertId: number) {
          return (
            <Button
              size="sm"
              variant="outlined"
              color="secondary"
              onClick={() => onDetailsClick?.(convertId)}
            >
              Details
            </Button>
          );
        },
      },
    ];
  }, [onDetailsClick]);

  return columns;
};

// Converted asset， Qty., USDC amount, Fee, TxID, Network, Status
export const useConvertDetailColumns = (
  options: ConvertDetailColumnsOptions,
) => {
  const { onTxClick } = options;

  const columns = React.useMemo<Column[]>(() => {
    return [
      {
        title: "Converted Asset",
        dataIndex: "converted_asset",
        align: "left",
        width: 150,
        render(asset: string) {
          return (
            <Flex itemAlign="center" gap={2}>
              <TokenIcon name={asset} />
              {asset}
            </Flex>
          );
        },
      },
      {
        title: "Qty.",
        dataIndex: "converted_qty",
        align: "left",
        width: 120,
        render(qty: number, record: ConvertTransaction) {
          return (
            <Text.numeral dp={6} padding={false}>
              {qty}
            </Text.numeral>
          );
        },
      },
      {
        title: "USDC Amount",
        dataIndex: "received_qty",
        align: "left",
        width: 120,
        render(qty: number, record: ConvertTransaction) {
          return (
            <Text.numeral dp={2} currency="$">
              {qty}
            </Text.numeral>
          );
        },
      },
      {
        title: "Fee",
        dataIndex: "haircut",
        align: "left",
        width: 100,
        render(haircut: number) {
          return (
            <Text.numeral dp={4} coloring showIdentifier>
              {haircut}
            </Text.numeral>
          );
        },
      },
      {
        title: "TxID",
        dataIndex: "tx_id",
        align: "left",
        width: 120,
        render(txId?: string) {
          if (!txId) return <Text intensity={54}>-</Text>;
          return (
            <Text.formatted
              rule="txId"
              copyable
              className="oui-underline oui-decoration-line-16 oui-decoration-dashed oui-underline-offset-4 oui-cursor-pointer"
              onClick={() => onTxClick?.(txId)}
            >
              {txId}
            </Text.formatted>
          );
        },
      },
      {
        title: "Network",
        dataIndex: "venue",
        align: "left",
        width: 120,
        render(venue: string, record: ConvertTransaction) {
          if (venue === "internal_fund") {
            return <Text>Internal</Text>;
          }
          return <Text>Chain {record.chain_id || "-"}</Text>;
        },
      },
      {
        title: "Status",
        dataIndex: "transaction_id",
        align: "left",
        width: 100,
        render() {
          // All detail transactions are completed if they appear in the list
          return <Text>Completed</Text>;
        },
      },
    ];
  }, [onTxClick]);

  return columns;
};
