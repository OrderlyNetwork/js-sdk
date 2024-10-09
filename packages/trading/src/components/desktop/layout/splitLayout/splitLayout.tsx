import React, { PropsWithChildren } from "react";
import Split, { SplitProps } from "@uiw/react-split";
import { SplitLineBar } from "./splitLineBar";

type SplitLayoutProps = PropsWithChildren<SplitProps> & {
  onSizeChange?: (size: string) => void;
};

export const SplitLayout: React.FC<SplitLayoutProps> = (props) => {
  const { onSizeChange, ...rest } = props;

  return (
    /* @ts-ignore */
    <Split
      {...rest}
      lineBar
      renderBar={(barProps: any) => (
        <SplitLineBar {...barProps} mode={props.mode} />
      )}
      onDragEnd={(_, width, num) => {
        // console.log("onDragEnd", width);
        onSizeChange?.(`${width}`);
      }}
    />
  );
};
