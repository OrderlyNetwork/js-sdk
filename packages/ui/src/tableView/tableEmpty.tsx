import { FC } from "react";
import { Box } from "../box";
import { Flex } from "../flex";
import { Text } from "../typography";
import EmptyStateIcon from "../icon/emptyData";

export const TableEmpty: FC<{ title?: string }> = (props) => {
  return (
    <Flex itemAlign="center" direction="column" gapY={4} py={8}>
      <Box>
        <EmptyStateIcon />
      </Box>
      <Text as="div" intensity={36} size="2xs">
        {props.title ?? "No results found."}
      </Text>
    </Flex>
  );
};
