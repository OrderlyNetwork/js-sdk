import React, { FC, PropsWithChildren, useMemo } from "react";
import { BottomSheetHeader } from "@/bottomSheet/bottomSheetHeader";

export interface BottomSheetProps {
  title?: string | React.ReactNode;
}

export const BottomSheet: FC<PropsWithChildren<BottomSheetProps>> = (props) => {
  const header = useMemo(() => {
    if (typeof props.title === "undefined" || typeof props.title !== "string")
      return null;
    return <BottomSheetHeader title={props.title} />;
  }, [props.title]);

  return (
    <div className={"rounded-t-2xl bg-background text-background-contrast"}>
      {header}
      <div>{props.children}</div>
    </div>
  );
};
