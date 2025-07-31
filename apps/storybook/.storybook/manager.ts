import { addons, State } from "storybook/manager-api";
import orderlyTheme from "./orderlyTheme";

addons.setConfig({
  theme: orderlyTheme,
  // https://storybook.js.org/docs/configure/user-interface/features-and-behavior#customize-the-ui
  layoutCustomisations: {
    // Always hide the toolbar on docs pages, and respect user preferences elsewhere.
    showToolbar(state: State, defaultValue: boolean) {
      if (state.viewMode === "docs") {
        return false;
      }
      return defaultValue;
    },
    // Hide the sidebar on the landing page, which has its own nav links to other pages.
    showSidebar(state: State, defaultValue: boolean) {
      if (state.viewMode === "docs") {
        return false;
      }
      return defaultValue;
    },
  },
});
