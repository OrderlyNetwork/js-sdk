import deUsdBg from "../../../assets/deusd_bg.png";
import deUsdBt from "../../../assets/deusd_bt.png";
import deUsdTp from "../../../assets/deusd_tp.png";
import { ReminderTheme } from "./types";

/**
 * deUSD theme configuration
 * Light theme with dark text and deUSD logo icons positioned on left and right
 */
export const deusdTheme: ReminderTheme = {
  background: {
    image: deUsdBg,
    style: {
      objectFit: "cover",
      objectPosition: "center",
    },
  },
  decorations: [
    {
      // Left-bottom deUSD icon (larger, partially visible on left)
      src: deUsdBt,
      position: { left: "-67px", top: "41px" },
      size: { width: "146px", height: "146px" },
      zIndex: 1,
    },
    {
      // Right-top bubbles cluster (rotated 15deg)
      src: deUsdTp,
      position: { left: "273.69px", top: "-60.31px" },
      size: { width: "136px", height: "136px" },
      transform: "rotate(15deg)",
      wrapper: true, // Needs wrapper container for proper positioning
      zIndex: 2,
    },
  ],
  colors: {
    mainText: "rgba(0, 0, 0, 0.88)",
    apyHighlight: "rgba(0, 0, 0, 0.88)", // deUSD uses same color but bold
    secondaryText: "rgba(0, 0, 0, 0.64)",
    disclaimer: "rgba(0, 0, 0, 0.64)",
    buttonText: "rgba(255, 255, 255, 0.98)",
    buttonBg: "rgba(0, 0, 0, 0.88)",
  },
  button: {
    background: "rgba(0, 0, 0, 0.88)",
    paddingLeft: "4px",
    paddingRight: "4px",
    paddingTop: "2px",
    paddingBottom: "2px",
    borderRadius: "4px",
  },
  mainTextWeight: 400, // deUSD uses regular weight
  apyUseBold: true, // deUSD uses bold for APY instead of color
};
