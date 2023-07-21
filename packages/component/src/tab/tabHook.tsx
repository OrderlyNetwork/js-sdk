import { useContext } from "react";
import { TabContext } from "./tabContext";

type TabHook = {
  toggleContentVisible: () => void;
  visible: boolean;
};

export const useTab = (): TabHook => {
  const { toggleContentVisible, contentVisible } = useContext(TabContext);
  return { toggleContentVisible, visible: contentVisible };
};
