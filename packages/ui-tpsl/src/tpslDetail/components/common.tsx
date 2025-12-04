import { Flex } from "@veltodefi/ui";

export const FlexCell = (props: { children: React.ReactNode }) => {
  return (
    <Flex
      direction={"column"}
      justify={"center"}
      itemAlign={"start"}
      className="oui-text-2xs oui-h-[36px]"
    >
      {props.children}
    </Flex>
  );
};
