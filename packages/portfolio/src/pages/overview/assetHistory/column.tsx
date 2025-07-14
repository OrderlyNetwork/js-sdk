import { useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { AssetHistoryStatusEnum } from "@orderly.network/types";
import {
  capitalizeFirstLetter,
  Text,
  Flex,
  TokenIcon,
  toast,
  type Column,
} from "@orderly.network/ui";
import { AssetSide } from "../assetChart/assetHistory.script";

type Options = {
  side: AssetSide;
  chainsInfo: any[];
  isDeposit: boolean;
  isWeb3Wallet: boolean;
};

export const useAssetHistoryColumns = (options: Options) => {
  const { side, chainsInfo, isDeposit, isWeb3Wallet } = options;
  const { t } = useTranslation();

  const onCopy = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success(t("common.copy.copied"));
  };

  const columns = useMemo(() => {
    const txIdColumn = {
      title: t("common.txId"),
      dataIndex: "tx_id",
      width: 120,
      render: (value, record) => {
        if (!value) {
          return <div className="oui-text-base-contrast-54">-</div>;
        }
        const chainInfo = (chainsInfo as any[])?.find(
          (item) => parseInt(record.chain_id) === parseInt(item.chain_id),
        );
        const explorer_base_url = chainInfo?.explorer_base_url;
        const href = `${explorer_base_url}/tx/${value}`;
        return (
          <a href={href} target="_blank" rel="noreferrer">
            {/* <Tooltip content={value} delayDuration={0}> */}
            <Text.formatted
              copyable={!!value}
              rule="txId"
              className="oui-underline oui-decoration-line-16 oui-decoration-dashed oui-underline-offset-4"
              onCopy={onCopy}
            >
              {value}
            </Text.formatted>
            {/* </Tooltip> */}
          </a>
        );
      },
    } as Column;

    const accountIdColumn = {
      title: t("common.accountId"),
      dataIndex: "account_id",
      width: 120,
      render: (value, record) => {
        const accountId = isDeposit
          ? record.from_account_id
          : record.to_account_id;

        return (
          <Text.formatted rule="address" copyable={!!accountId} onCopy={onCopy}>
            {accountId}
          </Text.formatted>
        );
      },
    } as Column;

    return [
      {
        title: t("common.token"),
        dataIndex: "token",
        width: 80,
        render: (value) => {
          return (
            <Flex gapX={1}>
              <TokenIcon name={value} size="xs" />
              <span>{value}</span>
            </Flex>
          );
        },
      },
      {
        title: t("common.time"),
        dataIndex: "created_time",
        width: 80,
        rule: "date",
      },
      isWeb3Wallet ? txIdColumn : accountIdColumn,
      {
        title: t("common.status"),
        dataIndex: "trans_status",
        width: 100,
        render: (value, recoed) => {
          value = isWeb3Wallet ? value : recoed.status;
          const statusMap = {
            [AssetHistoryStatusEnum.NEW]: t("assetHistory.status.pending"),
            [AssetHistoryStatusEnum.CONFIRM]: t("assetHistory.status.confirm"),
            [AssetHistoryStatusEnum.PROCESSING]: t(
              "assetHistory.status.processing",
            ),
            [AssetHistoryStatusEnum.COMPLETED]: t(
              "assetHistory.status.completed",
            ),
            [AssetHistoryStatusEnum.FAILED]: t("assetHistory.status.failed"),
          };
          return (
            statusMap[value as keyof typeof statusMap] ||
            capitalizeFirstLetter(value?.toLowerCase())
          );
        },
      },
      {
        title: t("common.amount"),
        dataIndex: "amount",
        width: 100,
        rule: "price",
        formatter: (value, record) =>
          isDeposit ? value - (record.fee ?? 0) : -(value - (record.fee ?? 0)),
        numeralProps: {
          coloring: true,
          showIdentifier: true,
        },
        // formatter: "date",
      },
    ] as Column[];
  }, [t, chainsInfo, side, isDeposit, isWeb3Wallet]);

  return columns;
};
