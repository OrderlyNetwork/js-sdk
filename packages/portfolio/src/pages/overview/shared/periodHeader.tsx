import { CardTitle, Flex, Select, Text } from "@orderly.network/ui";
import { PeriodType } from "./useAssetHistory";

export const PeriodTitle = (props: {
  onPeriodChange: (period: PeriodType) => void;
  periodTypes: string[];
  period: PeriodType;
}) => {
  return (
    <Flex justify={"between"}>
      <CardTitle>Performance</CardTitle>

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
  );
};
