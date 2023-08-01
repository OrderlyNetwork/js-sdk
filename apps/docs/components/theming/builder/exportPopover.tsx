import { Popover } from "@douyinfe/semi-ui";
import { useMemo } from "react";

export const ExportPopover = () => {
  const renderContent = () => {
    return (
      <div>
        <div>Export</div>
      </div>
    );
  };
  return (
    <Popover content={renderContent} trigger="click">
      <button>Export</button>
    </Popover>
  );
};
