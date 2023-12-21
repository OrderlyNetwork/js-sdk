import { useEffect } from "react";

export const useThemeUpdate = (root: HTMLDivElement | null) => {
  useEffect(() => {
    console.log("useThemeUpdate");
    const onStorage = (event) => {
      console.log(event);
    };

    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, []);
};
