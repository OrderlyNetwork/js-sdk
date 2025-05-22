import { useTranslation } from "@orderly.network/i18n";
import {
  Box,
  CloseCircleFillIcon,
  cn,
  Grid,
  Input,
  Text,
} from "@orderly.network/ui";
import { SearchIcon } from "../../icons";
import { TabName } from "../../type";
import { MarketsListWidget } from "../marketsList";
import { useMarketsContext } from "../marketsProvider";
import { getMarketsSheetColumns } from "./column";
import { MarketsSheetScriptReturn } from "./marketsSheet.script";

export type MarketsSheetProps = MarketsSheetScriptReturn & {
  className?: string;
};

export const MarketsSheet: React.FC<MarketsSheetProps> = (props) => {
  const { className, tabSort, onTabSort } = props;
  const { searchValue, onSearchValueChange, clearSearchValue } =
    useMarketsContext();

  const { t } = useTranslation();

  const search = (
    <Input
      value={searchValue}
      onValueChange={onSearchValueChange}
      placeholder={t("markets.search.placeholder")}
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
              className="oui-cursor-pointer oui-text-base-contrast-36"
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
      className={cn("oui-grid-rows-[auto,1fr] oui-font-semibold", className)}
      height="100%"
      width="100%"
    >
      <Box px={3} mt={3}>
        <Text size="base" intensity={80}>
          {t("common.markets")}
        </Text>
        {search}
      </Box>

      <div className="oui-relative">
        <Box
          width="100%"
          mt={2}
          className="oui-absolute oui-inset-y-0 oui-left-0 oui-right-9"
        >
          <MarketsListWidget
            type={TabName.All}
            initialSort={tabSort[TabName.All]}
            onSort={onTabSort(TabName.All)}
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
