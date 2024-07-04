import { CardTitle, Flex, Select, Text } from "@orderly.network/ui";
import { PeriodType } from "./useAssetHistory";

export const PeriodTitle = (props: {
  onPeriodChange: (period: PeriodType) => void;
  periodTypes: string[];
  period: PeriodType;
}) => {
  return (
    <Flex justify={"between"}>
      <CardTitle>Assets</CardTitle>

      <Flex gapX={2}>
        <Text intensity={36} size={"2xs"}>
          Updated daily at 00:00 UTC
        </Text>
        <div className={"oui-min-w-14"}>
          <Select.options
            size={"xs"}
            value={props.period}
            onValueChange={props.onPeriodChange}
            options={props.periodTypes.map((item) => ({
              value: item,
              label: item,
            }))}
          />
        </div>
      </Flex>
    </Flex>
  );
};
