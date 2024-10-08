import {
  Box,
  CloseCircleFillIcon,
  cn,
  Flex,
  Input,
  Text,
} from "@orderly.network/ui";
import { UseMarketsSheetScriptReturn } from "./marketsSheet.script";
import { SearchIcon } from "../../icons";
import { MarketsListWidget } from "../marketsList";
import { useMarketsContext } from "../marketsProvider";
import "../../style/index.css";

export type MarketsSheetProps = UseMarketsSheetScriptReturn & {
  className?: string;
};

export const MarketsSheet: React.FC<MarketsSheetProps> = (props) => {
  const { className } = props;

  const { searchValue, onSearchValueChange, clearSearchValue } =
    useMarketsContext();

  const search = (
    <Input
      value={searchValue}
      onValueChange={onSearchValueChange}
      placeholder="Search"
      classNames={{ root: "oui-border oui-border-line oui-mt-4" }}
      size="sm"
      prefix={
        <Box pl={3} pr={1}>
          <SearchIcon className="oui-text-base-contrast-36" />
        </Box>
      }
      suffix={
        searchValue && (
          <Box mr={2}>
            <CloseCircleFillIcon
              size={14}
              className="oui-text-base-contrast-36 oui-cursor-pointer"
              onClick={clearSearchValue}
            />
          </Box>
        )
      }
      autoComplete="off"
      autoFocus
    />
  );

  return (
    <Box
      className={cn("oui-font-semibold", className)}
      height="100%"
      width="100%"
    >
      <Box px={3} mt={3}>
        <Text size="base" intensity={80}>
          Market
        </Text>
        {search}
      </Box>

      <Box width="100%" mt={2} className="oui-h-[calc(100vh_-_88px)]">
        <MarketsListWidget type="all" sortKey="24h_amount" sortOrder="desc" />
      </Box>
    </Box>
  );
};
