import React, { useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Button,
  Flex,
  Text,
  TokenIcon,
  Tooltip,
  toast,
} from "@orderly.network/ui";
import type { Column } from "@orderly.network/ui";
import type { ConvertRecord, ConvertTransaction } from "./type";

export interface ConvertColumnsOptions {
  onDetailsClick?: (convertId: number) => void;
}

export interface ConvertDetailColumnsOptions {
  onTxClick?: (txId: string) => void;
  indexPrices: Record<string, number>;
  chainsInfo: any[];
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
  const { t } = useTranslation();
  const onCopy = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success(t("common.copy.copied"));
  };

  const columns = React.useMemo<Column[]>(() => {
    return [
      {
        title: t("portfolio.overview.column.convert.convertedAsset"),
        dataIndex: "converted_asset",
        align: "left",
        width: 250,
        render(convertedAssets: Record<string, number>) {
          return <ConvertedAssetColumn convertedAssets={convertedAssets} />;
        },
      },
      {
        title: t("portfolio.overview.column.convert.usdcAmount"),
        dataIndex: "received_qty",
        align: "left",
        width: 120,
        render(qty: number, record: ConvertRecord) {
          return <Text.numeral dp={6}>{qty}</Text.numeral>;
        },
      },
      {
        title: t("common.fee"),
        dataIndex: "details",
        align: "left",
        width: 100,
        render(details: ConvertRecord["details"]) {
          const totalHaircut = details.reduce(
            (sum, detail) => sum + detail.haircut,
            0,
          );
          return <Text.numeral dp={6}>{totalHaircut}</Text.numeral>;
        },
      },
      {
        title: t("common.type"),
        dataIndex: "type",
        align: "left",
        width: 120,
        render(type: string) {
          return <Text>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>;
        },
      },
      {
        title: t("portfolio.overview.column.convert.convertId"),
        dataIndex: "convert_id",
        align: "left",
        width: 100,
        render(convertId: number) {
          return (
            <Text.formatted onCopy={onCopy} copyable>
              {convertId}
            </Text.formatted>
          );
        },
      },
      {
        title: t("common.time"),
        dataIndex: "created_time",
        align: "left",
        width: 180,
        rule: "date",
      },
      {
        title: t("common.status"),
        dataIndex: "status",
        align: "left",
        width: 100,
        render(status: string) {
          return (
            <Text>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
          );
        },
      },
      {
        title: "",
        dataIndex: "updated_time",
        align: "center",
        width: 80,
        render(convertId: number, record: ConvertRecord) {
          return (
            <Button
              size="sm"
              variant="text"
              className="oui-text-primary"
              onClick={() => onDetailsClick?.(record.convert_id)}
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
  const { t } = useTranslation();
  const onCopy = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success(t("common.copy.copied"));
  };
  const columns = React.useMemo<Column[]>(() => {
    return [
      {
        title: t("portfolio.overview.column.convert.convertedAsset"),
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
        title: t("common.qty"),
        dataIndex: "converted_qty",
        align: "left",
        width: 100,
        render(qty: number, record: ConvertTransaction) {
          return (
            <Text.numeral dp={6} padding={false}>
              {qty}
            </Text.numeral>
          );
        },
      },
      {
        title: t("portfolio.overview.column.convert.usdcAmount"),
        dataIndex: "received_qty",
        align: "left",
        width: 100,
        render(qty: number, record: ConvertTransaction) {
          return (
            <Text.numeral dp={6}>
              {qty}
              {/* {getIndexPrice(record.converted_asset, options.indexPrices) * record.converted_qty} */}
            </Text.numeral>
          );
        },
      },
      {
        title: t("common.fee"),
        dataIndex: "haircut",
        align: "left",
        width: 100,
        render(haircut: number) {
          return <Text.numeral dp={6}>{haircut}</Text.numeral>;
        },
      },
      {
        title: t("common.txId"),
        dataIndex: "tx_id",
        align: "left",
        width: 150,
        render(txId: string, record: ConvertTransaction) {
          if (!txId) return <Text intensity={54}>-</Text>;
          const chainInfo = (options.chainsInfo as any[])?.find(
            (item) => record.chain_id === parseInt(item.chain_id),
          );
          const explorer_base_url = chainInfo?.explorer_base_url;
          const href = `${explorer_base_url}/tx/${txId}`;
          return (
            <a href={href} target="_blank" rel="noreferrer">
              <Text.formatted
                onCopy={onCopy}
                rule="txId"
                copyable={!!txId}
                className="oui-cursor-pointer oui-underline oui-decoration-line-16 oui-decoration-dashed oui-underline-offset-4"
              >
                {txId}
              </Text.formatted>
            </a>
          );
        },
      },
      {
        title: t("transfer.network"),
        dataIndex: "venue",
        align: "left",
        width: 150,
        render(venue: string, record: ConvertTransaction) {
          if (venue === "internal_fund") {
            return <Text>Internal</Text>;
          }
          return (
            <Text>
              {options.chainsInfo.find(
                (item) => item.chain_id == record.chain_id,
              )?.name || "-"}
            </Text>
          );
        },
      },
      {
        title: t("common.status"),
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
