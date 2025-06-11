import { FC, ReactNode, useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { API } from "@orderly.network/types";
import {
  Badge,
  capitalizeFirstLetter,
  Flex,
  modal,
  Statistic,
  Text,
} from "@orderly.network/ui";
import { commifyOptional } from "@orderly.network/utils";
import { FundingFeeButton } from "../../fundingFeeHistory/fundingFeeButton";
import { PositionHistorySide } from "../positionHistory.script";
import { PositionHistoryCellState } from "./positionHistoryCell.script";

export const SymbolToken: FC<PositionHistoryCellState> = (props) => {
  const { side, symbol } = props.item;
  const { t } = useTranslation();
  const isBuy = side === PositionHistorySide.buy;

  return (
    <Text.formatted
      intensity={80}
      rule="symbol"
      formatString="base-type"
      size="sm"
      // @ts-ignore
      prefix={
        <Badge color={isBuy ? "success" : "danger"} size="xs">
          {isBuy ? t("common.buy") : t("common.sell")}
        </Badge>
      }
      onClick={() => {
        props.onSymbolChange?.({ symbol: symbol } as API.Symbol);
      }}
      // showIcon
    >
      {symbol}
    </Text.formatted>
  );
};

export const Time: FC<PositionHistoryCellState> = (props) => {
  const { item } = props;

  return (
    <Text.formatted
      rule={"date"}
      formatString="yyyy-MM-dd hh:mm:ss"
      intensity={36}
      size="2xs"
    >
      {item.last_update_time}
    </Text.formatted>
  );
};

export const PositionHistoryType: FC<PositionHistoryCellState> = (props) => {
  const { item: record } = props;
  const { t } = useTranslation();

  const showAlert = () => {
    modal.alert({
      title: t("positions.liquidation"),
      message: (
        <Flex
          direction={"column"}
          width={"100%"}
          gap={2}
          className="oui-text-2xs oui-text-base-contrast-54"
        >
          {record.liquidation_id != null && (
            <Flex justify={"between"} width={"100%"}>
              <Text>{t("positions.history.liquidated.liquidationId")}</Text>
              <Text intensity={98}>{record.liquidation_id}</Text>
            </Flex>
          )}
          <Flex justify={"between"} width={"100%"}>
            <Text>{t("positions.history.liquidated.liquidatorFee")}</Text>
            <Text color="lose">
              {record.liquidator_fee > 0 && "-"}
              {commifyOptional(record.liquidator_fee)}
            </Text>
          </Flex>
          <Flex justify={"between"} width={"100%"}>
            <Text>{t("positions.history.liquidated.insFundFee")}</Text>
            <Text color="lose">
              {record.insurance_fund_fee > 0 && "-"}
              {commifyOptional(record.insurance_fund_fee)}
            </Text>
          </Flex>
        </Flex>
      ),
    });
  };

  const tags = useMemo(() => {
    const list: ReactNode[] = [];

    const status = record.position_status;

    const renderStatus = () => {
      if (status === "closed") {
        return t("positions.history.status.closed");
      } else if (status === "partial_closed") {
        return t("positions.history.status.partialClosed");
      } else {
        return capitalizeFirstLetter(status.replace("_", " "));
      }
    };

    list.push(
      <Badge color={status !== "closed" ? "primaryLight" : "neutral"} size="xs">
        {renderStatus()}
      </Badge>,
    );

    if (record.type === "adl") {
      list.push(
        <Badge color={"danger"} size="xs">
          {/* {capitalizeFirstLetter(record.type)} */}
          {t("positions.history.type.adl")}
        </Badge>,
      );
    } else if (record.type === "liquidated") {
      list.push(
        <Badge
          size="xs"
          color="danger"
          className="oui-cursor-pointer"
          onClick={showAlert}
        >
          <span className="oui-underline oui-decoration-dashed oui-decoration-[1px]">
            {/* {capitalizeFirstLetter(record.type)} */}
            {t("positions.history.type.liquidated")}
          </span>
        </Badge>,
      );
    }

    return list;
  }, [record]);

  return <Flex gap={1}>{tags}</Flex>;
};

export const ClosedQty: FC<PositionHistoryCellState> = (props) => {
  const { item } = props;
  const { t } = useTranslation();

  const closedQty =
    item.closed_position_qty != null
      ? Math.abs(item.closed_position_qty)
      : "--";

  return (
    <Statistic
      // label={
      //   <Text>Closed{<Text intensity={20}>{` (${props.base})`}</Text>}</Text>
      // }
      label={<Text>{t("positions.history.column.closed")}</Text>}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral dp={props.base_dp} padding={false} coloring intensity={80}>
        {closedQty}
      </Text.numeral>
    </Statistic>
  );
};

export const MaxClosedQty: FC<PositionHistoryCellState> = (props) => {
  const { item } = props;
  const { t } = useTranslation();

  const maxClosedQty =
    item.max_position_qty != null ? Math.abs(item.max_position_qty) : "--";
  return (
    <Statistic
      // label={
      //   <Text>
      //     Max closed{<Text intensity={20}>{` (${props.base})`}</Text>}
      //   </Text>
      // }
      label={<Text>{t("positions.history.column.maxClosed")}</Text>}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral dp={props.base_dp} padding={false} coloring intensity={80}>
        {maxClosedQty}
      </Text.numeral>
    </Statistic>
  );
};

export const AvgOpen: FC<PositionHistoryCellState> = (props) => {
  const { item } = props;
  const avgOpen =
    item.avg_open_price != null ? Math.abs(item.avg_open_price) : "--";
  const { t } = useTranslation();
  return (
    <Statistic
      label={
        <Flex gap={1}>
          {t("common.avgOpen")}
          <Text intensity={20}>(USDC)</Text>
        </Flex>
      }
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral dp={props.quote_dp} padding={false} coloring intensity={80}>
        {avgOpen}
      </Text.numeral>
    </Statistic>
  );
};

export const AvgClosed: FC<PositionHistoryCellState> = (props) => {
  const { item } = props;
  const avgClose =
    item.avg_close_price != null ? Math.abs(item.avg_close_price) : "--";
  const { t } = useTranslation();
  return (
    <Statistic
      label={
        <Flex gap={1}>
          {t("common.avgClose")}
          <Text intensity={20}>(USDC)</Text>
        </Flex>
      }
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral dp={props.quote_dp} padding={false} coloring intensity={80}>
        {avgClose}
      </Text.numeral>
    </Statistic>
  );
};

export const OpenTime: FC<PositionHistoryCellState> = (props) => {
  const { item } = props;
  const { t } = useTranslation();

  return (
    <Statistic
      label={<Text>{t("positions.history.column.timeOpened")}</Text>}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
      align="end"
    >
      <Text.formatted
        intensity={80}
        formatString="yyyy-MM-dd HH:mm:ss"
        rule={"date"}
      >
        {item.open_timestamp}
      </Text.formatted>
    </Statistic>
  );
};
export const ClosedTime: FC<PositionHistoryCellState> = (props) => {
  const { item } = props;
  const { t } = useTranslation();

  const child =
    item.position_status == "closed" && item.close_timestamp ? (
      <Text.formatted
        intensity={80}
        formatString="yyyy-MM-dd HH:mm:ss"
        rule={"date"}
      >
        {item.close_timestamp}
      </Text.formatted>
    ) : (
      "--"
    );

  return (
    <Statistic
      label={<Text>{t("positions.history.column.timeClosed")}</Text>}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
      align="end"
    >
      {child}
    </Statistic>
  );
};

export const FundingFee: FC<PositionHistoryCellState> = (props) => {
  return (
    <Flex
      justify={"end"}
      className="oui-text-2xs oui-w-full oui-py-2 oui-gap-1 oui-gap-1"
    >
      <Text intensity={36}>Funding fee: </Text>
      <FundingFeeButton
        fee={props.item.accumulated_funding_fee}
        symbol={props.item.symbol}
      />
    </Flex>
  );
};
