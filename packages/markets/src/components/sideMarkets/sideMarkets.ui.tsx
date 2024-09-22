import { Box, cn, Flex, Text } from "@orderly.network/ui";
import { UseSideMarketsScriptReturn } from "./sideMarkets.script";
import { CollapseIcon, ExpandIcon } from "../../icons";
import { ExpandMarketsWidget } from "../expandMarkets";
import { CollapseMarketsWidget } from "../collapseMarkets";
import { useSideMarketsContext } from "../sideMarketsProvider";
import "../../style/index.css";

export type SideMarketsProps = UseSideMarketsScriptReturn;

export const SideMarkets: React.FC<SideMarketsProps> = (props) => {
  const { collapsed, onCollapse } = props;

  const { activeTab, onTabChange, currentDataSource } = useSideMarketsContext();

  const header = (
    <Box width="100%">
      {collapsed ? (
        <ExpandIcon
          className="oui-text-base-contrast-12 oui-cursor-pointer"
          onClick={() => {
            onCollapse(false);
          }}
        />
      ) : (
        <Flex justify="between" px={3}>
          <Text size="base" intensity={80}>
            Market
          </Text>
          <CollapseIcon
            className="oui-text-base-contrast-12 oui-cursor-pointer"
            onClick={() => {
              onCollapse(true);
            }}
          />
        </Flex>
      )}
    </Box>
  );

  const content = (
    <Box
      width="100%"
      className={cn(
        collapsed ? "oui-h-[calc(100%_-_52px)]" : "oui-h-[calc(100%_-_56px)]"
      )}
    >
      {collapsed ? (
        <CollapseMarketsWidget dataSource={currentDataSource!} />
      ) : (
        <ExpandMarketsWidget activeTab={activeTab} onTabChange={onTabChange} />
      )}
    </Box>
  );

  return (
    <Box
      className={cn(
        "oui-font-semibold oui-transition-all",
        cn(collapsed ? "oui-w-[70px]" : "oui-w-[280px]")
      )}
      height="100%"
    >
      <Flex
        direction="column"
        intensity={900}
        r="2xl"
        pt={3}
        gapY={5}
        height="100%"
      >
        {header}
        {content}
      </Flex>
    </Box>
  );
};
