import { addons } from "@storybook/manager-api";
import { themes } from "@storybook/theming";
import orderlyTheme from "./orderlyTheme";

addons.setConfig({
  theme: orderlyTheme,
  
});
