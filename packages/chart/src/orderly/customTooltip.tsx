import { Box, Text } from "@orderly.network/ui";

export const OrderlyChartTooltip = (props: {
  label: string;
  value: string | number;
  unit?: string;
  coloring?: boolean;
}) => {
  const { label, value, unit = "USDC", coloring = false } = props;
  return (
    <Box intensity={600} p={3} r="md">
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
      <Text size="2xs" intensity={54} weight="semibold">
        {label}
      </Text>
    </Box>
  );
};
