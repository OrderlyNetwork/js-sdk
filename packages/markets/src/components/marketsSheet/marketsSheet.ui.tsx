import {
  Box,
  CloseCircleFillIcon,
  cn,
  Grid,
  Input,
  Text,
} from "@orderly.network/ui";
import { UseMarketsSheetScriptReturn } from "./marketsSheet.script";
import { SearchIcon } from "../../icons";
import { MarketsListWidget } from "../marketsList";
import { useMarketsContext } from "../marketsProvider";
import { getMarketsSheetColumns } from "./column";

export type MarketsSheetProps = UseMarketsSheetScriptReturn & {
  className?: string;
};

export const MarketsSheet: React.FC<MarketsSheetProps> = (props) => {
  const { className, tabSort, onTabSort } = props;

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
    />
  );

  return (
    <Grid
      cols={1}
      className={cn("oui-font-semibold oui-grid-rows-[auto,1fr]", className)}
      height="100%"
      width="100%"
    >
      <Box px={3} mt={3}>
        <Text size="base" intensity={80}>
          Markets
        </Text>
        {search}
      </Box>

      <div className="oui-relative">
        <Box
          width="100%"
          mt={2}
          className="oui-absolute oui-left-0 oui-right-9 oui-top-0 oui-bottom-0"
        >
          <MarketsListWidget
            type="all"
            sortKey={tabSort?.sortKey}
            sortOrder={tabSort?.sortOrder}
            onSort={onTabSort}
            getColumns={getMarketsSheetColumns}
            tableClassNames={{
              root: "!oui-bg-base-8",
              scroll: "oui-pb-[calc(env(safe-area-inset-bottom))]",
            }}
          />
        </Box>
      </div>
    </Grid>
  );
};
