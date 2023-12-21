import { useEffect } from "react";
import { useDemoContext } from "../demoContext";

export const useThemeUpdate = (root?: HTMLElement) => {
  const { colors } = useDemoContext();
  useEffect(() => {
    // const data = sessionStorage.getItem("THEME_DOCUMENT");
    // console.log("*******", data, root);
    if (!root) return;

    try {
      if (colors) {
        // const theme = JSON.parse(data);
        Object.keys(colors).forEach((key) => {
          root?.style.setProperty(key, colors[key]);
        });
      }
    } catch (error) {
      console.log(error);
    }
  }, [root, colors]);

  useEffect(() => {
    const el = document.getElementById("theme-root-el");
    // console.log(root);
    const onStorage = (event) => {
      // console.log(event);
      const { detail } = event;
      root?.style.setProperty(detail.key, detail.value);
    };

    // window.addEventListener("storage", onStorage);
    el?.addEventListener("theme-changed", onStorage);

    return () => {
      el?.removeEventListener("theme-changed", onStorage);
    };
  }, [root]);
};
