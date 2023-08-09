import React, { FC, PropsWithChildren, useMemo } from "react";
import { BottomSheetHeader } from "@/bottomSheet/bottomSheetHeader";
import Sheet from "react-modal-sheet";

export interface BottomSheetProps {
  title?: string | React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export const BottomSheet: FC<PropsWithChildren<BottomSheetProps>> = (props) => {
  const header = useMemo(() => {
    if (typeof props.title === "undefined") return null;

    if (typeof props.title === "string") {
      return (
        <Sheet.Header>
          <BottomSheetHeader title={props.title} onClose={props.onClose} />
        </Sheet.Header>
      );
    }

    if (React.isValidElement(props.title)) {
      return <Sheet.Header>{props.title}</Sheet.Header>;
    }
    return null;
    // return <BottomSheetHeader title={props.title} />;
  }, [props.title]);

  return (
    <Sheet
      isOpen={props.isOpen}
      onClose={props.onClose}
      detent={"content-height"}
    >
      <Sheet.Container>
        {header}
        <Sheet.Content>{props.children}</Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop />
    </Sheet>
  );
};
