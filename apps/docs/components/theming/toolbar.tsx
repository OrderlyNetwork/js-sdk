import { TabletSmartphone, MonitorCheck, Component } from "lucide-react";
import { useContext } from "react";
import { DemoContext, EditorViewMode } from "../demoContext";
import clsx from "clsx";

export const Toolbar = () => {
  const { viewMode, onViewModeChange } = useContext(DemoContext);
  return (
    <div className="py-2 px-4">
      <div className={"flex items-center space-x-3"}>
        <button
          className={clsx(
            "text-base-contrast-54 p-1 rounded hover:bg-base-contrast-20",
            viewMode === EditorViewMode.Component && "text-primary-light"
          )}
          onClick={() => onViewModeChange(EditorViewMode.Component)}
        >
          <Component />
        </button>
        <button
          className={clsx(
            "text-base-contrast-54 p-1 rounded hover:bg-base-contrast-20",
            viewMode === EditorViewMode.Desktop && "text-primary-light"
          )}
          onClick={() => onViewModeChange(EditorViewMode.Desktop)}
        >
          <MonitorCheck />
        </button>
        <button
          className={clsx(
            "text-base-contrast-54 p-1 rounded hover:bg-base-contrast-20",
            viewMode === EditorViewMode.Mobile && "text-primary-light"
          )}
          onClick={() => onViewModeChange(EditorViewMode.Mobile)}
        >
          <TabletSmartphone />
        </button>
      </div>
    </div>
  );
};
