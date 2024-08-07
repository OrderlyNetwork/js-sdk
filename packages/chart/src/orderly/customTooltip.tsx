import { Box, Flex, Text } from "@orderly.network/ui";

export const OrderlyChartTooltip = (props: {
  label: string;
  value: string | number;
  unit?: string;
  prefix?: React.ReactNode;
  titleClassName?: string;
  coloring?: boolean;
}) => {
  const { label, value, prefix, unit = "USDC", coloring = false } = props;

  // console.log("OrderlyChartTooltip", props);

  return (
    <Box intensity={600} p={3} r="md">
      <Flex direction={"row"} className={props.titleClassName}>
        {prefix}
        <Text.numeral
          unit={unit}
          as="div"
          size="sm"
          coloring={coloring}
          showIdentifier={coloring}
          unitClassName="oui-text-base-contrast-54 oui-ml-1"
          weight="semibold"
        >
          {value}
        </Text.numeral>
      </Flex>
      <Text size="2xs" intensity={54} weight="semibold">
        {label}
      </Text>
    </Box>
  );
};
