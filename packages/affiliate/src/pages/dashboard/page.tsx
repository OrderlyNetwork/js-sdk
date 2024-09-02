import { Flex, Box, cn } from "@orderly.network/ui";
import { TabWidget } from "./tab";

export const DashboardPage = (props: {
  classNames?: {
    root?: string;
    loadding?: string;
    home?: string;
    dashboard?: string;
  };
}) => {
  const { classNames = {} } = props;
  const { root, ...rest } = classNames;
  
  return (
    <div id="oui-affiliate-dashboard-page" className={cn("oui-w-full oui-tracking-tight", root)}>
      <TabWidget classNames={rest} />
    </div>
  );
};
