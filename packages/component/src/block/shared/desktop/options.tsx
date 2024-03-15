import { FC, useMemo } from "react";
import { ShareOptions } from "../type";
import { cn } from "@/utils";
import { Checkbox } from "@/checkbox";

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
          "orderly-h-[20px] hover:orderly-cursor-pointer orderly-items-center orderly-flex"
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
          onCheckedChange={(checked) => {
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
  
        <div className="orderly-text-sm orderly-text-base-contrast-54 orderly-pl-1">
          {text}
        </div>
      </div>
    );
  };