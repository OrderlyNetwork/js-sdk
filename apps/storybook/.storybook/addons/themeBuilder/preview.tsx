import { useChannel, useEffect } from "@storybook/preview-api";
import { EVENTS, PARAM_KEY, VARIABLE_KEYS } from "./constants";
import { hexToRgb, isColorValue, rgbToHex } from "./helper";

export const withThemeBuilder = (StoryFn, context) => {
  //   const channel = context.parameters.globals?.channel;

  // const rootRef = useRef<HTMLDivElement>(null);

  const themeChangeHandler = ({ changedValues }) => {
    // console.log(getComputedStyle(document.documentElement));
    // console.log("++++changedValues", changedValues);
    Object.entries(changedValues).forEach(([key, value]) => {
      let newValue = isColorValue(key)
        ? hexToRgb(value as string)?.join(" ") ?? ""
        : value;
      document.documentElement.style.setProperty(key, newValue as string);
      // rootRef.current?.style.setProperty(key, value as string);
    });
  };

  const emit = useChannel({
    [EVENTS.CHANGE]: themeChangeHandler,
  });

  useEffect(() => {
    const root = document.documentElement;

    const styles = getComputedStyle(root);
    // console.log("++++root", root, styles);

    // console.log(styles.getPropertyValue("--oui-color-primary"));

    const cssVariables = {};
    for (let i = 0; i < VARIABLE_KEYS.length; i++) {
      const property = VARIABLE_KEYS[i];

      let value = styles.getPropertyValue(property).trim();

      if (isColorValue(property)) {
        value = rgbToHex(value.split(" ").map(Number));
      }

      cssVariables[property] = value;
    }

    console.log("++++cssVariables", cssVariables);

    emit(EVENTS.THEME_RESTORE, cssVariables);
  }, []);

  return StoryFn();
};
