import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Flex, Select, Text } from "@orderly.network/ui";
import { commifyOptional } from "@orderly.network/utils";
import { SummaryReturns } from "./summary.script";

export const Summary: FC<SummaryReturns> = (props) => {
  const { t } = useTranslation();

  return (
    <Flex
      id="oui-affiliate-affiliate-summary"
      r={"2xl"}
      p={5}
      width={"100%"}
      height={"100%"}
      gap={4}
      direction={"column"}
      className="oui-bg-base-9"
    >
      <Title {...props} />
      <CommissionData {...props} />
      <Flex direction={"column"} width={"100%"} gap={2}>
        <Row
          title={`${t("affiliate.referralVol")} (USDC)`}
          value={props.referralVol}
          dp={2}
          {...props}
        />
        <Row
          title={t("affiliate.referees")}
          value={props.referees}
          dp={0}
          {...props}
        />
        <Row
          title={t("affiliate.summary.refereesTraded")}
          value={props.refereesTades}
          dp={0}
          {...props}
        />
      </Flex>
    </Flex>
  );
};

const Title: FC<SummaryReturns> = (props) => {
  const { t } = useTranslation();

  return (
    <Flex direction={"row"} justify={"between"} width={"100%"}>
      <Text className="oui-text-lg">{t("affiliate.summary")}</Text>
      <div className={"oui-min-w-14"}>
        <Select.options
          size={"xs"}
          value={props.period}
          onValueChange={props.onPeriodChange}
          options={props.periodTypes}
        />
      </div>
    </Flex>
  );
};

const CommissionData: FC<SummaryReturns> = (props) => {
  const { t } = useTranslation();

  return (
    <Flex
      r="2xl"
      width={"100%"}
      direction={"column"}
      itemAlign="start"
      gap={2}
      className="oui-bg-base-contrast-4 oui-px-5 oui-py-12"
    >
      <Text intensity={54} size="sm">
        {`${t("affiliate.commission")} (USDC)`}
      </Text>
      <Flex
        direction={"row"}
        gap={3}
        className="oui-text-xl md:oui-text-2xl xl:oui-text-3xl"
      >
        <Text className="oui-text-success">
          {commifyOptional(props.commission, { fix: 2, fallback: "0" })}
        </Text>
      </Flex>
    </Flex>
  );
};

const Row: FC<
  SummaryReturns & {
    title: string;
    value: number;
    dp: number;
  }
> = (props) => {
  return (
    <Flex direction={"row"} justify={"between"} width={"100%"}>
      <Text
        intensity={54}
        className="oui-text-2xs md:oui-text-xs xl:oui-text-sm"
      >
        {props.title}
      </Text>
      <Text className="oui-text-xs md:oui-text-sm xl:oui-text-base">
        {commifyOptional(props.value, { fix: props.dp, fallback: "0" })}
      </Text>
    </Flex>
  );
};
