import React, { useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Button, Flex, Text, TokenIcon, Tooltip } from "@orderly.network/ui";
import type { Column } from "@orderly.network/ui";
import type { ConvertRecord, ConvertTransaction } from "./type";

export interface ConvertColumnsOptions {
  onDetailsClick?: (convertId: number) => void;
}

export interface ConvertDetailColumnsOptions {
  onTxClick?: (txId: string) => void;
}

export const ConvertedAssetColumn = ({
  convertedAssets,
}: {
  convertedAssets: Record<string, number>;
}) => {
  const { t } = useTranslation();
  const assets = useMemo(() => {
    return Object.keys(convertedAssets);
  }, [convertedAssets]);

  const tooltipContent = useMemo(() => {
    return (
      <Flex
        direction="column"
        gap={2}
        className="oui-w-[275px] oui-font-semibold oui-text-base-contrast-80"
      >
        <Flex
          itemAlign="center"
          justify="between"
          className="oui-w-full oui-text-2xs oui-text-base-contrast-36"
        >
          <div>{t("common.assets")}</div>
          <div>{t("common.qty")}</div>
        </Flex>
        {assets.map((asset) => (
          <Flex
            key={asset}
            itemAlign="center"
            justify="between"
            className="oui-w-full"
          >
            <Flex itemAlign="center" gap={1}>
              <TokenIcon size="xs" name={asset} />
              <Text.formatted>{asset}</Text.formatted>
            </Flex>
            <div>
              <Text.formatted>{convertedAssets[asset]}</Text.formatted>
            </div>
          </Flex>
        ))}
      </Flex>
    );
  }, [assets]);

  return (
    <Flex itemAlign="center" gap={2}>
      <div className="oui-relative oui-flex">
        {assets.slice(0, 3).map((asset, index) => (
          <div
            key={asset}
            className="oui-relative"
            style={{
              marginLeft: index > 0 ? "-8px" : "0",
              zIndex: assets.length + index,
            }}
          >
            <TokenIcon size="xs" name={asset} />
          </div>
        ))}
      </div>
      <Tooltip content={tooltipContent}>
        <Text.formatted className="oui-cursor-pointer oui-underline oui-decoration-line-16 oui-decoration-dashed oui-underline-offset-4">
          {assets.slice(0, 3).join(", ")}{" "}
          {assets.length > 3 && `+${assets.length - 3}`}
        </Text.formatted>
      </Tooltip>
    </Flex>
  );
};

export const useConvertColumns = (options: ConvertColumnsOptions) => {
  const { onDetailsClick } = options;

  const columns = React.useMemo<Column[]>(() => {
    return [
      {
        title: "Converted Asset",
        dataIndex: "converted_asset",
        align: "left",
        width: 250,
        render(convertedAssets: Record<string, number>) {
          return <ConvertedAssetColumn convertedAssets={convertedAssets} />;
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
          return <Text.numeral dp={2}>{totalHaircut}</Text.numeral>;
        },
      },
      {
        title: "Type",
        dataIndex: "type",
        align: "left",
        width: 120,
      },
      {
        title: "Convert ID",
        dataIndex: "convert_id",
        align: "left",
        width: 100,
        render(convertId: number) {
          return <Text.formatted copyable>{convertId}</Text.formatted>;
        },
      },
      {
        title: "Time",
        dataIndex: "created_time",
        align: "left",
        width: 180,
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
              variant="text"
              className="oui-text-primary"
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
        render(qty: number) {
          return <Text.numeral dp={2}>{qty}</Text.numeral>;
        },
      },
      {
        title: "Fee",
        dataIndex: "haircut",
        align: "left",
        width: 100,
        render(haircut: number) {
          return <Text.numeral dp={2}>{haircut}</Text.numeral>;
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
              className="oui-cursor-pointer oui-underline oui-decoration-line-16 oui-decoration-dashed oui-underline-offset-4"
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
          return <Text>Success</Text>;
        },
      },
    ];
  }, [onTxClick]);

  return columns;
};
