import { Button as BaseButton, buttonVariants, ButtonProps } from "./button";
import { StatusGuardButton } from "./statusGuardButton";
import { SegmentedButton, type SegmentedButtonProps } from "./segmented";

type Button = typeof BaseButton & {
  buttonVariants: typeof buttonVariants;
  Segmented: typeof SegmentedButton;
  StatusGuardButton: typeof StatusGuardButton;
  // LoggedGuardButton: typeof SiginGuardButton;
  // IconButton: typeof IconButton;
};

const Button = BaseButton as Button;

Button.buttonVariants = buttonVariants;
Button.Segmented = SegmentedButton;
Button.StatusGuardButton = StatusGuardButton;

export type { SegmentedButtonProps, ButtonProps };

export { IconButton } from "./iconButton";

export default Button;