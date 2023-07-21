import { Button, buttonVariants, ButtonProps } from "./button";
import { SegmentedButton, type SegmentedButtonProps } from "./segmented";

type CompoundedComponent = typeof Button & {
  // buttonVariants: typeof buttonVariants;
};

export type { SegmentedButtonProps, ButtonProps };

export { Button, buttonVariants, SegmentedButton };
