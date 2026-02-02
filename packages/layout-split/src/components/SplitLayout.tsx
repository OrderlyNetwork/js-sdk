import React, { PropsWithChildren, forwardRef } from "react";
import Split, { SplitProps } from "@uiw/react-split";
import { SplitLineBar } from "./SplitLineBar";

/**
 * Props for SplitLayout component
 * Extends @uiw/react-split SplitProps with custom onSizeChange callback
 */
export type SplitLayoutProps = PropsWithChildren<SplitProps> & {
  /** Callback when split size changes (receives percentage as string) */
  onSizeChange?: (size: string) => void;
};

/**
 * SplitLayout component
 * Wrapper around @uiw/react-split with Orderly-styled split line bar
 *
 * @example
 * ```tsx
 * <SplitLayout mode="horizontal" onSizeChange={(size) => console.log(size)}>
 *   <div>Left panel</div>
 *   <div>Right panel</div>
 * </SplitLayout>
 * ```
 */
export const SplitLayout = forwardRef<Split, SplitLayoutProps>((props, ref) => {
  const { onSizeChange, ...rest } = props;
  return (
    <Split
      ref={ref}
      {...rest}
      lineBar
      renderBar={(barProps) => <SplitLineBar {...barProps} mode={props.mode} />}
      onDragEnd={(_, width) => onSizeChange?.(`${width}`)}
    />
  );
});

SplitLayout.displayName = "SplitLayout";
