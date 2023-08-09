import { Button as BaseButton, buttonVariants, ButtonProps } from "./button";
import { ConnectGuardButton } from "./connectGuardButton";
import { SegmentedButton, type SegmentedButtonProps } from "./segmented";
import { SiginGuardButton } from "./siginGuardButton";

type Button = typeof BaseButton & {
  buttonVariants: typeof buttonVariants;
  SegmentedButton: typeof SegmentedButton;
  ConnectGuardButton: typeof ConnectGuardButton;
  LoggedGuardButton: typeof SiginGuardButton;
};

const Button = BaseButton as Button;

Button.buttonVariants = buttonVariants;
Button.SegmentedButton = SegmentedButton;
Button.ConnectGuardButton = ConnectGuardButton;
Button.LoggedGuardButton = SiginGuardButton;

export type { SegmentedButtonProps, ButtonProps };

export default Button;
