import { FC, useMemo } from "react";
import { ShareOptions } from "../../types/types";
import { cn } from "@orderly.network/ui";
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
    <div
      className={cn(
        "oui-h-[20px] hover:oui-cursor-pointer oui-items-center oui-flex oui-cursor-pointer"
      )}
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
        checked={isSelected}
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

      <div className="oui-text-sm oui-text-base-contrast-54 oui-pl-1">
        {text}
      </div>
    </div>
  );
};
