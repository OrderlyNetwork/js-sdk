import React, { useCallback, useMemo } from "react";
import { produce } from "immer";
import { useTranslation } from "@orderly.network/i18n";
import { FeeTierModule } from "@orderly.network/portfolio";
import { ARBITRUM_MAINNET_CHAINID } from "@orderly.network/types";
import { Button, cn, Flex, Text, useScreen } from "@orderly.network/ui";
import type { ButtonProps, Column } from "@orderly.network/ui";
import { PathEnum } from "../../../constant";
import { useNav } from "../../../hooks/useNav";

const useWooStaking = (inputs: { decimals: number; chainId: number }) => {
  return {
    rawData: 0, // mock data for Storybook
    formattedData: "0.0", // mock data for Storybook
    isLoading: false, // mock data for Storybook
  };
};

const TopRightIcon: React.FC<React.SVGAttributes<SVGSVGElement>> = (props) => {
  return (
    <svg
      width={12}
      height={13}
      viewBox="0 0 12 13"
      fill="currentColor"
      focusable={false}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M8.49512 10.9954C9.59962 10.9954 10.4951 10.0999 10.4951 8.99536V3.99536C10.4951 2.89086 9.59962 1.99536 8.49512 1.99536H3.49512C2.39062 1.99536 1.49512 2.89086 1.49512 3.99536V8.99536C1.49512 10.0999 2.39062 10.9954 3.49512 10.9954H8.49512ZM4.49512 8.49536C4.36712 8.49536 4.23362 8.45236 4.13562 8.35486C3.94062 8.15936 3.94062 7.83136 4.13562 7.63586L6.13562 5.63586L4.99512 4.49536H7.99512V7.49536L6.85461 6.35486L4.85461 8.35486C4.75711 8.45236 4.62312 8.49536 4.49512 8.49536Z"
        fill="#fff"
        fillOpacity={0.8}
      />
    </svg>
  );
};

const TradingBtn: React.FC<ButtonProps> = (props) => {
  const { t } = useTranslation();
  const { onRouteChange } = useNav();
  return (
    <Button
      {...props}
      onClick={() => {
        onRouteChange({
          href: PathEnum.Perp,
          name: t("common.trading"),
        });
      }}
    >
      <Flex gap={1}>
        <Text>{t("common.trading")}</Text>
        <TopRightIcon />
      </Flex>
    </Button>
  );
};

const StakeBtn: React.FC<ButtonProps> = (props) => {
  const { t } = useTranslation();
  return (
    <Button
      onClick={() =>
        window.open("https://app.orderly.network/staking", "_blank")
      }
      {...props}
    >
      <Flex gap={1}>
        <Text>{t("tradingRewards.stake")} ORDER</Text>
        <TopRightIcon />
      </Flex>
    </Button>
  );
};

const FeeTierPage: React.FC = () => {
  const { t } = useTranslation();
  const { isMobile } = useScreen();

  const { formattedData, isLoading } = useWooStaking({
    decimals: 18,
    chainId: ARBITRUM_MAINNET_CHAINID,
  });

  const customDataSource = useMemo(() => {
    const baseData: any[] = [
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
        description: "(1.8K - 15.1K ORDER)",
      },
      {
        tier: 3,
        or: "/",
        staking_level: `${t("portfolio.feeTier.column.tier")} 3 - 4`,
        description: "(15.1K - 83K ORDER)",
      },
      {
        tier: 4,
        or: "/",
        staking_level: `${t("portfolio.feeTier.column.tier")} 5`,
        description: "(83K - 189.6K ORDER)",
      },
      {
        tier: 5,
        or: "/",
        staking_level: `${t("portfolio.feeTier.column.tier")} 6`,
        description: "(189.6K - 430.7K ORDER)",
      },
      {
        tier: 6,
        or: "/",
        staking_level: `${t("portfolio.feeTier.column.tier")} 7 - 8`,
        description: `(430.7K - 2209.7K ORDER)`,
      },
      {
        tier: 7,
        or: "/",
        staking_level: `${t("portfolio.feeTier.column.tier")} 9 - 10`,
        description: `above 2209.7K ORDER`,
      },
    ];
    if (!isMobile) {
      baseData.push({
        tier: null,
        or: "",
        staking_level: <StakeBtn size={"sm"} />,
      });
    }
    return baseData;
  }, [t, isMobile]);

  const dataAdapter = useCallback(
    (columns: Column[], dataSource: any[], ctx?: { tier?: number }) => {
      const cols: Column[] = [
        ...columns.slice(0, 2),
        {
          title: t("portfolio.feeTier.column.or"),
          dataIndex: "or",
          width: 100,
          align: "center",
        },
        {
          title: `ORDER ${t("portfolio.feeTier.column.stakingLevel")}`,
          dataIndex: "staking",
          align: "center",
          width: 150,
          render: (_, row) => {
            const { staking_level, description } = row;
            return (
              <Flex direction={"column"}>
                {staking_level}
                {description && (
                  <div
                    className={cn(
                      ctx?.tier === row.tier
                        ? "oui-text-black/[.66]"
                        : "oui-text-base-contrast-36",
                    )}
                  >
                    {description}
                  </div>
                )}
              </Flex>
            );
          },
        },
        ...columns.slice(2),
      ];

      const rows = produce(dataSource, (draft) => {
        if (!isMobile) {
          draft?.push({
            tier: "",
            maker_fee: "",
            taker_fee: "",
            volume_min: null,
            volume_max: null,
            volume_node: <TradingBtn size="sm" />,
            or: "",
            staking: null,
            staking_min: null,
            staking_max: null,
          });
        }
      });

      const mergedDataSource = rows?.map((item, index) => ({
        ...item,
        ...customDataSource[index],
      }));

      return {
        columns: cols,
        dataSource: mergedDataSource,
      };
    },
    [t, customDataSource, isMobile],
  );

  const headerDataAdapter = useCallback(
    (original: any[]) => {
      return [
        ...original.slice(0, 2),
        {
          label: `${t("portfolio.feeTier.header.myStake")} (WOO)`,
          needShowTooltip: false,
          value: (
            <Text size={isMobile ? "xs" : "base"}>
              {isLoading ? "--" : formattedData}
            </Text>
          ),
        },
        ...original.slice(2),
      ];
    },
    [t, isMobile, isLoading, formattedData],
  );

  return (
    <>
      <div className="oui-overflow-y-auto oui-pb-16">
        <FeeTierModule.FeeTierPage
          key={isMobile ? "mobile" : "desktop"}
          dataAdapter={dataAdapter}
          headerDataAdapter={headerDataAdapter}
          // onRow={() => {
          //   return {
          //     normal: {
          //       className: "oui-h-[54px]",
          //     },
          //     active: {
          //       className:
          //         "oui-pointer-events-none oui-h-[54px] oui-text-[rgba(0,0,0,0.88)] oui-gradient-brand",
          //     },
          //   };
          // }}
          onCell={() => {
            return {
              normal: {},
              active: {
                // className: "oui-text-white",
              },
            };
          }}
        />
      </div>
      {isMobile && (
        <Flex
          m={4}
          gapX={3}
          itemAlign={"center"}
          justify={"between"}
          className="oui-fixed oui-bottom-0 oui-left-0 oui-right-0"
        >
          <TradingBtn size="md" fullWidth />
          <StakeBtn size="md" fullWidth />
        </Flex>
      )}
    </>
  );
};

export default FeeTierPage;
