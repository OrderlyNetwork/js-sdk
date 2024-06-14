import { FC } from "react";
import { DateRangePicker } from "../../pickers/dateRangePicker";
import { Box } from "../../box";
import { Flex } from "../../flex";
import {
  SelectWithOptions,
  type SelectWithOptionsProps,
} from "../../select/withOptions";
import { DatePicker } from "../../pickers/datepicker";

type FilterType = "select" | "input" | "date" | "custom";

type SelectFilter = {
  name: string;
  type: "select";
  // options: DataFilterOption[];
} & SelectWithOptionsProps;

type DateFilterMode = "range" | "single";

type DateFilter = {
  name: string;
  type: "date";
  // range?: DataFilterDateRange;
  mode?: DateFilterMode;
};

type DataFilterItems = (string | SelectFilter | DateFilter)[];

export type DataFilterProps = {
  items: DataFilterItems;
  onFilter: (filter: { name: string; value: string }) => void;
};

export const DataFilterRenderer: FC<{
  type: FilterType;
  onChange?: (value: any) => void;
  [key: string]: any;
}> = (props) => {
  const { onChange, type, ...rest } = props;
  switch (type) {
    case "select":
      return (
        <div className="oui-min-w-32">
          <SelectWithOptions
            size="xs"
            {...(rest as SelectWithOptionsProps)}
            onValueChange={onChange}
          />
        </div>
      );
    case "date":
      return (
        <div>
          <DatePicker onChange={onChange} size="xs" />
        </div>
      );
    case "input":
    default:
      return <div>No Component</div>;
  }
};

export const DataTableFilter = (props: DataFilterProps) => {
  const onChange = (key: string, value: any) => {
    props.onFilter({ name: key, value });
  };
  return (
    <Flex
      justify={"start"}
      gapX={3}
      p={3}
      className="oui-datagrid-filter-bar oui-border-b oui-border-line"
    >
      {props.items.map((item, index: number) => {
        const props =
          typeof item === "string" ? { type: item as FilterType } : item;

        return (
          <DataFilterRenderer
            key={index}
            {...props}
            onChange={(value: any) => {
              onChange((props as any).name ?? props.type, value);
            }}
          />
        );
      })}
    </Flex>
  );
};
