import { Button as BaseButton, buttonVariants, ButtonProps } from "./button";
import { ConnectGuardButton } from "./connectGuardButton";
import { SegmentedButton, type SegmentedButtonProps } from "./segmented";
import { SiginGuardButton } from "./siginGuardButton";

type Button = typeof BaseButton & {
  buttonVariants: typeof buttonVariants;
  SegmentedButton: typeof SegmentedButton;
  ConnectGuardButton: typeof ConnectGuardButton;
  LoggedGuardButton: typeof SiginGuardButton;
  // IconButton: typeof IconButton;
};

const Button = BaseButton as Button;

Button.buttonVariants = buttonVariants;
Button.SegmentedButton = SegmentedButton;
Button.ConnectGuardButton = ConnectGuardButton;
Button.LoggedGuardButton = SiginGuardButton;
// Button.IconButton = IconButton;

export type { SegmentedButtonProps, ButtonProps };

export { IconButton } from "./iconButton";

export default Button;
