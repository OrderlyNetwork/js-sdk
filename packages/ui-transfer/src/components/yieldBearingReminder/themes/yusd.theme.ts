import { yusdBg, yusdBt, yusdTp } from "../icons";
import { ReminderTheme } from "./types";

/**
 * YUSD theme configuration
 * Dark theme with white text and coin icons positioned on the right side
 */
export const yusdTheme: ReminderTheme = {
  background: {
    image: yusdBg,
    style: {
      objectFit: "cover",
      objectPosition: "center",
      transform: "translateY(35px)",
    },
  },
  decorations: [
    {
      // Top-right coin (blurred, smaller)
      src: yusdTp,
      position: { left: "293px", top: "-17px" },
      size: { width: "42px", height: "55px" },
      blur: "1px",
      zIndex: 2,
    },
    {
      // Bottom-right coin (main, larger)
      src: yusdBt,
      position: { left: "282px", top: "31px" },
      size: { width: "106px", height: "87px" },
      zIndex: 3,
    },
  ],
  colors: {
    mainText: "rgba(255, 255, 255, 0.98)",
    apyHighlight: "#00b49e",
    secondaryText: "rgba(255, 255, 255, 0.54)",
    disclaimer: "rgba(255, 255, 255, 0.36)",
    buttonText: "rgba(255, 255, 255, 0.8)",
  },
  button: {
    // Text link style - no background
  },
  mainTextWeight: 600,
  apyUseBold: false, // YUSD uses color highlight
};
