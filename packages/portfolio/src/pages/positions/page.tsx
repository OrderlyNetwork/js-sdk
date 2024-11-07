import { PositionsProps, PositionsWidget } from "@orderly.network/ui-positions";
import { Flex, Text, Divider, Box } from "@orderly.network/ui";

export const PositionsPage = (props: PositionsProps) => {
  return (
    <Flex
      // p={6}
      direction={"column"}
      itemAlign={"start"}
      gap={4}
      width="100%"
      height="100%"
    >
      <Flex>
        <Text size="lg">Positions</Text>
      </Flex>
      <Divider className="oui-w-full" />
      {/* 26(title height) + 1(divider) + 32 (padding) */}
      <Box width="100%" className="oui-h-[calc(100%_-_59px)]">
        <PositionsWidget {...props} />
      </Box>
    </Flex>
  );
};
