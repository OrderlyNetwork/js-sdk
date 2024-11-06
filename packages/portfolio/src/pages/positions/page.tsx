import { Flex, Text, Divider } from "@orderly.network/ui";
import { PositionsProps, PositionsWidget } from "@orderly.network/ui-positions";


export const PositionsPage = (props: PositionsProps) => {
  return (
    <Flex p={6} direction={"column"} itemAlign={"start"} gap={4}>
      <Flex>
        <Text size="lg">Positions</Text>
      </Flex>
      <Divider className="oui-w-full" />
      <PositionsWidget {...props} />
    </Flex>
  );
};
