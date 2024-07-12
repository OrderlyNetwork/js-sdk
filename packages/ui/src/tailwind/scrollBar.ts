import { hex2int } from "@orderly.network/utils";
import plugin from "tailwindcss/plugin";

export const scrollBarPlugin = () =>
  plugin(function ({ addComponents }) {
    const hideScrollBar = {
      ".hide-scrollbar::-webkit-scrollbar": {
        display: "none",
      },
      ".hide-scrollbar::-webkit-scrollbar-thumb": {
        display: "none",
      },
    };

    addComponents(hideScrollBar);

    const scrollBarH = {
        ".scrollbar-vertical::-webkit-scrollbar": {
          width: "4px",
          
        },
        ".scrollbar-vertical::-webkit-scrollbar-thumb": {
          borderRadius: "2px",
          borderStyle: "dashed",
          borderColor: "transparent",
          borderWidth: "1px",
          background: "rgba(255,255,255,0.04)",
          backgroundClip: "padding-box",
        },
        ".scrollbar-vertical::-webkit-scrollbar-thumb:hover": {
          background: "rgba(255,255,255,0.08)",
          borderRadius: "3px",
        },
      };
      addComponents(scrollBarH);
  });
