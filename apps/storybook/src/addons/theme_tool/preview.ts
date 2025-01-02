import { useEffect } from "@storybook/preview-api";
import { EVENTS, PARAM_KEY } from "./constants";

export const withThemeBuilder = (StoryFn, context) => {
  const channel = context.parameters.globals?.channel;

  useEffect(() => {
    const handleThemeChange = ({ colors }) => {
      console.log("++++colors", colors);
      // Apply theme changes to the preview iframe
      Object.entries(colors).forEach(([variable, value]) => {
        // document.documentElement.style.setProperty(variable, value);
      });
    };

    channel.on(EVENTS.CHANGE, handleThemeChange);
    return () => {
      channel.off(EVENTS.CHANGE, handleThemeChange);
    };
  }, [channel]);

  return StoryFn();
};
