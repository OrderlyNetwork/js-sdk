import { useMemo } from "react";
import { useTranslation } from "@veltodefi/i18n";
import {
  Column,
  Flex,
  Picker,
  Select,
  Text,
  TokenIcon,
  useScreen,
} from "@veltodefi/ui";
import { Decimal } from "@veltodefi/utils";
import { ProcessedFundingData } from "./fundingOverview.script";

const createFundingRenderer =
  (dp: number = 5) =>
  (value: number) => {
    if (value === 0) {
      return <Text> - </Text>;
    }

    return (
      <Text.numeral
        rule="percentages"
        dp={dp}
        coloring
        rm={Decimal.ROUND_DOWN}
        showIdentifier
      >
        {value}
      </Text.numeral>
    );
  };

export const useFundingOverviewColumns = (
  selectedPeriod: string,
  setSelectedPeriod: (value: string) => void,
) => {
  const { t } = useTranslation();
  const { isMobile } = useScreen();

  return useMemo<Column<ProcessedFundingData>[]>(() => {
    return [
      {
        title: t("markets.column.market"),
        dataIndex: "symbol",
        onSort: true,
        width: 135,
        className: isMobile ? "oui-pl-0" : undefined,
        render: (value) => (
          <Flex gapX={1}>
            <TokenIcon
              symbol={value}
              className={isMobile ? "oui-size-[18px]" : "oui-size-5"}
            />

            <Text.formatted
              rule="symbol"
              formatString="base-type"
              weight="semibold"
            >
              {value}
            </Text.formatted>
          </Flex>
        ),
      },
      {
        title: t("markets.funding.column.estFunding"),
        dataIndex: "estFunding",
        width: 120,
        onSort: true,
        render: (value, record) => (
          <div>
            <Text.numeral
              rule="percentages"
              dp={5}
              coloring
              rm={Decimal.ROUND_DOWN}
              showIdentifier
            >
              {value}
            </Text.numeral>
            <span className="oui-text-base-contrast-54">
              {`/ ${record.fundingInterval}h`}
            </span>
          </div>
        ),
      },
      {
        title: t("markets.funding.column.lastFunding"),
        dataIndex: "lastFunding",
        width: 90,
        onSort: true,
        render: createFundingRenderer(),
      },
      {
        title: t("markets.funding.column.1dAvg"),
        dataIndex: "funding1d",
        width: 90,
        onSort: true,
        render: createFundingRenderer(),
      },
      {
        title: t("markets.funding.column.3dAvg"),
        dataIndex: "funding3d",
        width: 90,
        onSort: true,
        render: createFundingRenderer(),
      },
      {
        title: t("markets.funding.column.7dAvg"),
        dataIndex: "funding7d",
        width: 90,
        onSort: true,
        render: createFundingRenderer(),
      },
      {
        title: t("markets.funding.column.14dAvg"),
        dataIndex: "funding14d",
        width: 90,
        onSort: true,
        render: createFundingRenderer(),
      },
      {
        title: t("markets.funding.column.30dAvg"),
        dataIndex: "funding30d",
        width: 90,
        onSort: true,
        render: createFundingRenderer(),
      },
      {
        title: t("markets.funding.column.90dAvg"),
        dataIndex: "funding90d",
        width: 90,
        onSort: true,
        render: createFundingRenderer(),
      },
      {
        title: (
          <div className="oui-flex oui-gap-1">
            <FundingPeriodSelect
              value={selectedPeriod}
              onValueChange={setSelectedPeriod}
            />
            <span>{t("markets.funding.column.positiveRate")}</span>
          </div>
        ),
        dataIndex: selectedPeriod,
        width: 130,
        align: "right",
        onSort: true,
        render: createFundingRenderer(2),
      },
    ];
  }, [t, isMobile, selectedPeriod, setSelectedPeriod]);
};

type FundingPeriodSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
};

const FundingPeriodSelect = (props: FundingPeriodSelectProps) => {
  const { t } = useTranslation();
  const { isMobile } = useScreen();

  const options = useMemo(() => {
    return [
      {
        label: t("common.select.1d"),
        value: "1dPositive",
      },
      {
        label: t("common.select.3d"),
        value: "3dPositive",
      },
      {
        label: t("common.select.7d"),
        value: "7dPositive",
      },
      {
        label: t("common.select.14d"),
        value: "14dPositive",
      },
      {
        label: t("common.select.30d"),
        value: "30dPositive",
      },
      {
        label: t("common.select.90d"),
        value: "90dPositive",
      },
    ];
  }, [t]);

  if (isMobile) {
    return (
      <Picker
        size="sm"
        value={props.value}
        onValueChange={props.onValueChange}
        options={options}
      />
    );
  }

  return (
    <Select.options
      size="xs"
      value={props.value}
      onValueChange={props.onValueChange}
      options={options}
    />
  );
};
