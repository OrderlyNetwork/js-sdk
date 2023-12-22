import { getStorage } from "@/helper/storage";
import { path } from "ramda";
import { default as defaultStyles } from "../../constants/theme";

// console.log(defaultStyles);

export default path(["@layer base", ":root"], defaultStyles);

export const getDefaultColors = () => {
  const data = getStorage("THEME_DOCUMENT");
  return {
    ...defaultStyles,
    ...data,
  };
};

export const mergeStyles = (key: string, value: string) => {
  return {
    ...defaultStyles,
    [key]: value,
  };
};
