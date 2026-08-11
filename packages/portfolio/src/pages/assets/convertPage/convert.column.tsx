/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Decimal } from "@orderly.network/utils";
import type { ConvertRecord, ConvertTransaction } from "../type";

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
  details = [],
}: {
  convertedAssets?: Record<string, number> | null;
  details?: ConvertTransaction[];
}) => {
  const { t } = useTranslation();
  const assets = useMemo(() => {
    const convertedAssetNames = Object.keys(convertedAssets ?? {}).filter(
      Boolean,
    );

    // Failed conversions can have an empty `converted_asset` summary while
    // the asset name is still available on the transaction details.
    if (convertedAssetNames.length > 0) {
      return convertedAssetNames;
    }

    return Array.from(
      new Set(
        details
          .map((detail) => detail.converted_asset)
          .filter((asset): asset is string => Boolean(asset)),
      ),
    );
  }, [convertedAssets, details]);

  const quantities = useMemo<Record<string, number | string>>(() => {
    if (
      convertedAssets &&
      Object.keys(convertedAssets).some((asset) => Boolean(asset))
    ) {
      return convertedAssets;
    }

    return details.reduce<Record<string, number | string>>((result, detail) => {
      if (detail.converted_asset) {
        result[detail.converted_asset] = new Decimal(
          result[detail.converted_asset] ?? 0,
        )
          .plus(detail.converted_qty ?? 0)
          .toString();
      }
      return result;
    }, {});
  }, [convertedAssets, details]);

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
              <Text.formatted>{quantities[asset]}</Text.formatted>
            </div>
          </Flex>
        ))}
      </Flex>
    );
  }, [assets, quantities, t]);

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
        width: 200,
        maxWidth: 200,
        render(
          convertedAssets: Record<string, number> | null | undefined,
          record: ConvertRecord,
        ) {
          return (
            <ConvertedAssetColumn
              convertedAssets={convertedAssets}
              details={record.details}
            />
          );
        },
      },
      {
        title: t("portfolio.overview.column.convert.usdcAmount"),
        dataIndex: "received_qty",
        align: "left",
        width: 150,
        render(qty: number) {
          return (
            <Text.numeral dp={6} padding={false}>
              {qty}
            </Text.numeral>
          );
        },
      },
      {
        title: t("common.fee"),
        dataIndex: "details",
        align: "left",
        width: 120,
        render(details: ConvertRecord["details"]) {
          const totalHaircut = details.reduce(
            (sum, detail) => sum + detail.haircut,
            0,
          );
          return (
            <Text.numeral dp={6} padding={false}>
              {totalHaircut}
            </Text.numeral>
          );
        },
      },
      {
        title: t("common.type"),
        dataIndex: "type",
        align: "left",
        width: 150,
        render(type: string) {
          return <Text>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>;
        },
      },
      {
        title: t("portfolio.overview.column.convert.convertId"),
        dataIndex: "convert_id",
        align: "left",
        width: 150,
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
        width: 160,
        rule: "date",
      },
      {
        title: t("common.status"),
        dataIndex: "status",
        align: "left",
        width: 150,
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
              {t("portfolio.overview.column.convert.details")}
            </Button>
          );
        },
      },
    ];
  }, [onDetailsClick, t]);

  return columns;
};

// Converted asset， Qty., USDC amount, Fee, TxID, Network, Status
export const useConvertDetailColumns = (
  options: ConvertDetailColumnsOptions,
) => {
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
        render(qty: number) {
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
        render(qty: number) {
          return (
            <Text.numeral dp={6} padding={false}>
              {qty}
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
          return (
            <Text.numeral dp={6} padding={false}>
              {haircut}
            </Text.numeral>
          );
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
        dataIndex: "chain_id",
        align: "left",
        width: 150,
        render(venue: string, record: ConvertTransaction) {
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
        title: t("common.result"),
        dataIndex: "result",
        align: "left",
        width: 100,
        render(result: string) {
          return (
            <Text>{result?.charAt(0).toUpperCase() + result?.slice(1)}</Text>
          );
        },
      },
    ];
  }, [t]);

  return columns;
};
