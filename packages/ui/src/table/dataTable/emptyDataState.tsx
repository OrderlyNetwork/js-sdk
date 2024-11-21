import EmptyStateIcon from "../../icon/emptyData";
import { Flex } from "../../flex";
import { Box } from "../../box";
import { ExtensionPositionEnum, installExtension } from "../../plugin";
import { Text } from "../../typography";

export const EmptyDataState = (props: { title?: string }) => {
  return (
    <Flex itemAlign={"center"} direction={"column"}>
      <Box mb={3}>
        <EmptyStateIcon />
      </Box>
      <Text as="div" intensity={36} size="2xs">
        {props.title ?? "No results found."}
      </Text>
    </Flex>
  );
};

installExtension<{ title?: string }>({
  name: "emptyDataIdentifier",
  positions: [ExtensionPositionEnum.EmptyDataIdentifier],
})(EmptyDataState);
