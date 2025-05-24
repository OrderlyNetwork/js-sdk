import React from "react";
// import { useIndexPrice } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { Button, Flex, Text, TokenIcon } from "@orderly.network/ui";
import type { Column } from "@orderly.network/ui";

export interface ColumnsOptions {
  onClick?: (id: string) => void;
}

const INDEX_PRICE = 1;
const COLLATERAL_RATIO = 100;
// TODO: use real index price
// const { data } = useIndexPrice("");

export const useAssetsColumns = (options: ColumnsOptions) => {
  const { t } = useTranslation();
  const { onClick } = options;
  const columns = React.useMemo<Column[]>(() => {
    return [
      {
        title: "token",
        dataIndex: "token",
        align: "left",
        width: 150,
        render(val: string) {
          return (
            <Flex itemAlign="center" gap={2}>
              <TokenIcon name={val} />
              {val}
            </Flex>
          );
        },
      },
      {
        title: "Qty.",
        dataIndex: "holding",
        align: "left",
        width: 170,
      },
      {
        title: "index price",
        dataIndex: "price",
        align: "left",
        width: 100,
        render: () => INDEX_PRICE,
      },
      {
        title: "Collateral ratio",
        dataIndex: "ratio",
        align: "left",
        width: 100,
        render: () => `${COLLATERAL_RATIO}%`,
      },
      {
        title: "Asset contribution",
        dataIndex: "holding",
        align: "left",
        width: 100,
        render(val: number, record) {
          return (
            <Text>
              {val * INDEX_PRICE} {record.token}
            </Text>
          );
        },
      },
      {
        title: null,
        dataIndex: "account_id",
        align: "center",
        width: 100,
        render(id: string) {
          return (
            <Button
              size={"sm"}
              variant={"outlined"}
              color={"secondary"}
              onClick={() => onClick?.(id)}
            >
              Transfer
            </Button>
          );
        },
      },
    ];
  }, [t]);
  return columns;
};
