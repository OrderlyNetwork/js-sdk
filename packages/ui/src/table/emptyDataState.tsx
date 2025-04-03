import { FC } from "react";
import { Box } from "../box";
import { Flex } from "../flex";
import { Text } from "../typography";
import EmptyStateIcon from "../icon/emptyData";
import { ExtensionPositionEnum, installExtension } from "../plugin";
import { useLocale } from "../locale";

export const EmptyDataState: FC<{ title?: string; className?: string }> = (
  props
) => {
  const [locale] = useLocale("empty");

  return (
    <Flex
      itemAlign="center"
      direction="column"
      gapY={4}
      className={props.className}
    >
      <Box>
        <EmptyStateIcon />
      </Box>
      <Text as="div" intensity={36} size="2xs">
        {props.title ?? locale.description}
      </Text>
    </Flex>
  );
};

installExtension<{ title?: string }>({
  name: "emptyDataIdentifier",
  positions: [ExtensionPositionEnum.EmptyDataIdentifier],
})(EmptyDataState);
