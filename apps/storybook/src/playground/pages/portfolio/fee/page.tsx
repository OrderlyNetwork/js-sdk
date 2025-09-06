import React, { useCallback, useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { FeeTierModule } from "@orderly.network/portfolio";
import { ARBITRUM_MAINNET_CHAINID } from "@orderly.network/types";
import { Flex, Text } from "@orderly.network/ui";
import type { Column } from "@orderly.network/ui";

const useWooStaking = (inputs: { decimals: number; chainId: number }) => {
  return {
    rawData: 0, // mock data for Storybook
    formattedData: "0.0", // mock data for Storybook
    isLoading: false, // mock data for Storybook
  };
};

const FeeTierPage: React.FC = () => {
  const { t } = useTranslation();
  const customDataSource = useMemo(() => {
    return [
      {
        tier: 1,
        or: "/",
        staking_level: "--",
        description: "",
      },
      {
        tier: 2,
        or: "/",
        staking_level: `${t("portfolio.feeTier.column.tier")} 1 - 2`,
        description: "(1.8K - 15.1K WOO)",
      },
      {
        tier: 3,
        or: "/",
        staking_level: `${t("portfolio.feeTier.column.tier")} 3 - 4`,
        description: "(15.1K - 83K WOO)",
      },
      {
        tier: 4,
        or: "/",
        staking_level: `${t("portfolio.feeTier.column.tier")} 5`,
        description: "(83K - 189.6K WOO)",
      },
      {
        tier: 5,
        or: "/",
        staking_level: `${t("portfolio.feeTier.column.tier")} 6`,
        description: "(189.6K - 430.7K WOO)",
      },
      {
        tier: 6,
        or: "/",
        staking_level: `${t("portfolio.feeTier.column.tier")} 7 - 8`,
        description: `(430.7K - 2209.7K WOO)`,
      },
      {
        tier: 7,
        or: "/",
        staking_level: `${t("portfolio.feeTier.column.tier")} 9 - 10`,
        description: `above 2209.7K WOO`,
      },
    ];
  }, [t]);
  const dataAdapter = useCallback(
    (columns: Column[], dataSource: any[]) => {
      const cols: Column[] = [
        ...columns.slice(0, 2),
        {
          title: t("portfolio.feeTier.column.or"),
          dataIndex: "or",
          width: 100,
          align: "center",
        },
        {
          title: `WOO ${t("portfolio.feeTier.column.stakingLevel")}`,
          dataIndex: "staking",
          align: "center",
          width: 150,
          render: (_, row) => {
            const { staking_level, description } = row;
            return (
              <Flex direction={"column"}>
                {staking_level}
                {description && (
                  <div className="oui-text-white/[.36] state-text">
                    {description}
                  </div>
                )}
              </Flex>
            );
          },
        },
        ...columns.slice(2),
      ];

      return {
        columns: cols,
        dataSource: dataSource?.map((item, index) => ({
          ...item,
          ...customDataSource[index],
        })),
      };
    },
    [t],
  );

  const { formattedData, isLoading } = useWooStaking({
    decimals: 18,
    chainId: ARBITRUM_MAINNET_CHAINID,
  });

  const headerDataAdapter = useCallback(
    (original: any[]) => {
      return [
        ...original.slice(0, 2),
        {
          label: `${t("portfolio.feeTier.header.myStake")} (WOO)`,
          needShowTooltip: false,
          value: <Text size="base">{isLoading ? "--" : formattedData}</Text>,
        },
        ...original.slice(2),
      ];
    },
    [t, isLoading, formattedData],
  );
  return (
    <FeeTierModule.FeeTierPage
      dataAdapter={dataAdapter}
      headerDataAdapter={headerDataAdapter}
      onRow={() => {
        return {
          normal: {
            className: "oui-h-[54px]",
          },
          active: {
            className:
              "box oui-h-[54px] oui-text-[rgba(0,0,0,0.88)] oui-pointer-events-none",
          },
        };
      }}
    />
  );
};

export default FeeTierPage;
