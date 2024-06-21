import { FC, useState } from "react";
import {
  DateRangePicker,
  DateRangePickerProps,
} from "../../pickers/dateRangePicker";
import { Box } from "../../box";
import { Flex } from "../../flex";
import {
  SelectWithOptions,
  type SelectWithOptionsProps,
} from "../../select/withOptions";
import { DatePicker, DatePickerProps } from "../../pickers/datepicker";
// import { DateRange } from "react-day-picker";

type FilterType = "select" | "input" | "date" | "range" | "custom";

type SelectFilter = {
  name: string;
  type: "select";
  // options: DataFilterOption[];
} & SelectWithOptionsProps;

// type DateFilterMode = "range" | "single";

type DateFilter = {
  name: string;
  type: "date";
  // range?: DataFilterDateRange;
  // mode?: DateFilterMode;
} & DatePickerProps;

type DateRangeFilter = {
  name: string;
  type: "range";
} & DateRangePickerProps;

type DataFilterItems = (SelectFilter | DateFilter | DateRangeFilter)[];

export type DataFilterProps = {
  items: DataFilterItems;
  onFilter: (filter: { name: string; value: any }) => void;
};

const FilterDatePicker = (props: DatePickerProps) => {
  return (
    <div>
      <DatePicker
        size="xs"
        {...props}
        mode={"single"}
        onChange={(date) => {
          console.log(date);
        }}
      />
    </div>
  );
};

const FilterDateRangePicker = (props: DateRangePickerProps) => {
  return (
    <div className={"oui-min-w-[180px]"}>
      <DateRangePicker
        size="xs"
        {...props}
        // onChange={(range) => {
        //   console.log(range);
        // }}
      />
    </div>
  );
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
        <div className="oui-min-w-28">
          <SelectWithOptions
            size="xs"
            {...(rest as SelectWithOptionsProps)}
            onValueChange={onChange}
          />
        </div>
      );
    case "date":
      return <FilterDatePicker {...(rest as DatePickerProps)} />;
    case "range":
      return (
        <FilterDateRangePicker
          {...(rest as DateRangePickerProps)}
          onChange={onChange}
        />
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

        if (props.type === "date" && typeof item === "string") {
          (props as DatePickerProps).mode = "range";
        }

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
