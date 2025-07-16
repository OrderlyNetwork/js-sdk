import { addons } from "storybook/manager-api";
import orderlyTheme from "./orderlyTheme";

addons.setConfig({
  theme: orderlyTheme,
});
