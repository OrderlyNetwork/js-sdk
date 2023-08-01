import { Cross2Icon } from "@radix-ui/react-icons";
import React, { FC, useMemo } from "react";

export interface BottomSheetHeaderProps {
  title?: string | React.ReactNode;
  onClose?: () => void;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export const BottomSheetHeader: FC<BottomSheetHeaderProps> = (props) => {
  const title = useMemo(() => {
    if (typeof props.title === "undefined") return null;
    if (typeof props.title === "string") {
      return <div className={"text-xl font-bold"}>{props.title}</div>;
    }

    return props.title;
  }, [props.title]);

  const trailing = useMemo(() => {
    if (typeof props.trailing === "undefined") {
      return (
        <button>
          <Cross2Icon />
        </button>
      );
    }

    return props.trailing;
  }, [props.trailing]);

  return (
    <div className={"flex py-3 px-2"}>
      <div className={"flex-1 text-center"}>{title}</div>
      <div className={"flex items-center"}>{trailing}</div>
    </div>
  );
};
