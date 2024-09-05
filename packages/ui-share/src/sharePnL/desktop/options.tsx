import { FC, useMemo } from "react";
import { ShareOptions } from "../../types/types";
import { Flex, Text, cn } from "@orderly.network/ui";
import { Checkbox } from "./checkbox";

export const ShareOption: FC<{
  type: ShareOptions;
  curType: Set<ShareOptions>;
  setShareOption: any;
}> = (props) => {
  const { type, curType, setShareOption } = props;

  const text = useMemo(() => {
    switch (type) {
      case "openPrice":
        return "Open price";
      case "openTime":
        return "Opened at";
      case "markPrice":
        return "Mark price";
      case "quantity":
        return "Quantity";
      case "leverage":
        return "Leverage";
    }
  }, [type]);

  const isSelected = curType.has(type);

  return (
    <Flex
      itemAlign={"center"}
      gap={1}
      className={cn("hover:oui-cursor-pointer")}
      onClick={() => {
        // setPnlFormat(type);
        setShareOption((value: Set<ShareOptions>) => {
          const updateSet = new Set(value);
          if (isSelected) {
            updateSet.delete(type);
          } else {
            updateSet.add(type);
          }
          return updateSet;
        });
      }}
    >
      <Checkbox
        size={16}
        checked={isSelected}
        className="oui-pt-[2px]"
        onCheckedChange={(checked: boolean) => {
          setShareOption((value: Set<ShareOptions>) => {
            const updateSet = new Set(value);
            if (isSelected) {
              updateSet.delete(type);
            } else {
              updateSet.add(type);
            }
            return updateSet;
          });
        }}
      />

      <Text size="xs" intensity={54} >
        {text}
      </Text>
    </Flex>
  );
};
