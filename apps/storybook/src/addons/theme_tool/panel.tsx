import { useChannel } from "@storybook/manager-api";
import { AddonPanel } from "@storybook/components";
import { EVENTS } from "./constants";
import { ThemeEditor } from "./components/editor";

export const Panel = (props) => {
  const emit = useChannel({});

  const handleColorChange = (colorVar: string, value: string) => {
    emit(EVENTS.CHANGE, { colors: newColors });
  };

  return (
    <AddonPanel {...props}>
      <ThemeEditor />
    </AddonPanel>
  );
};
