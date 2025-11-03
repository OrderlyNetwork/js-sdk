import { CSSProperties } from "react";

/**
 * Configuration for a decorative image in the reminder component
 */
export interface DecorationImage {
  /** Image source (imported PNG) */
  src: string;
  /** Position styles */
  position: {
    left: string;
    top: string;
  };
  /** Size styles */
  size: {
    width: string;
    height: string;
  };
  /** CSS transform (e.g., "rotate(15deg)") */
  transform?: string;
  /** Blur amount (e.g., "1px") */
  blur?: string;
  /** Z-index for layering */
  zIndex?: number;
  /** Whether to wrap the image in a positioned container (needed for deUSD) */
  wrapper?: boolean;
}

/**
 * Color scheme for the reminder component
 */
export interface ReminderColors {
  /** Main text color */
  mainText: string;
  /** APY highlight color */
  apyHighlight: string;
  /** Secondary text color */
  secondaryText: string;
  /** Disclaimer text color */
  disclaimer: string;
  /** Button text color */
  buttonText: string;
  /** Button background color (optional) */
  buttonBg?: string;
}

/**
 * Button style configuration
 */
export interface ButtonStyle {
  /** Background color */
  background?: string;
  /** Padding */
  paddingLeft?: string;
  paddingRight?: string;
  paddingTop?: string;
  paddingBottom?: string;
  /** Border radius */
  borderRadius?: string;
}

/**
 * Complete theme configuration for a reminder variant
 */
export interface ReminderTheme {
  /** Background image configuration */
  background: {
    image: string;
    style?: CSSProperties;
  };
  /** Array of decorative images */
  decorations: DecorationImage[];
  /** Color scheme */
  colors: ReminderColors;
  /** Button style */
  button: ButtonStyle;
  /** Font weight for main text (YUSD: 600, deUSD: mixed) */
  mainTextWeight?: number;
  /** Whether APY uses bold instead of color (deUSD specific) */
  apyUseBold?: boolean;
}
