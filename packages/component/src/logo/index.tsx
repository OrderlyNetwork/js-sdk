import { MainLogo } from "./mainLogo";
import { SecondaryLogo } from "./secondaryLogo";

type Logo = typeof MainLogo & {
  secondary: typeof SecondaryLogo;
};

export const Logo = MainLogo as Logo;

Logo.secondary = SecondaryLogo;
