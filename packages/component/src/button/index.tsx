import { Button as BaseButton, buttonVariants, ButtonProps } from "./button";
import { SegmentedButton, type SegmentedButtonProps } from "./segmented";

type Button = typeof BaseButton & {
  buttonVariants: typeof buttonVariants;
  Segmented: typeof SegmentedButton;

  // LoggedGuardButton: typeof SiginGuardButton;
  // IconButton: typeof IconButton;
};

const Button = BaseButton as Button;

Button.buttonVariants = buttonVariants;
Button.Segmented = SegmentedButton;

export type { SegmentedButtonProps, ButtonProps };

export { IconButton } from "./iconButton";

export default Button;