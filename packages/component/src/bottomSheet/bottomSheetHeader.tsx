import { Cross2Icon } from "@radix-ui/react-icons";
import React, { FC, useMemo } from "react";

export interface BottomSheetHeaderProps {
  title?: string | React.ReactNode;
  onClose: () => void;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export const BottomSheetHeader: FC<BottomSheetHeaderProps> = (props) => {
  const title = useMemo(() => {
    if (typeof props.title === "undefined") return null;
    if (typeof props.title === "string") {
      return <div className={"text-[20px]"}>{props.title}</div>;
    }

    return props.title;
  }, [props.title]);

  const trailing = useMemo(() => {
    if (typeof props.trailing === "undefined") {
      return (
        <button onClick={() => props.onClose()}>
          <Cross2Icon fontSize={"20"} />
        </button>
      );
    }

    return props.trailing;
  }, [props.trailing]);

  return (
    <div className={"flex p-5"}>
      <div className={"flex-1 text-center"}>{title}</div>
      <div className={"flex items-center"}>{trailing}</div>
    </div>
  );
};
