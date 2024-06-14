import { buttonVariants } from "../../button/button";
import { DayPicker } from "react-day-picker";

import { ChevronLeftIcon, ChevronRightIcon } from "../../icon";
import { tv, cnBase } from "tailwind-variants";

// const datePickerVariants = tv({
//   slots: {},
// });

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cnBase("oui-p-3 oui-bg-base-7", className)}
      classNames={{
        months:
          "oui-flex oui-flex-col sm:oui-flex-row oui-space-y-4 sm:oui-space-x-4 sm:oui-space-y-0",
        month: "oui-space-y-4",
        caption:
          "oui-flex oui-justify-center oui-pt-1 oui-relative oui-items-center",
        caption_label: "oui-text-sm oui-font-medium",
        nav: "oui-space-x-1 oui-flex oui-items-center",
        nav_button: cnBase(
          buttonVariants({ variant: "text" }),
          "oui-h-7 oui-w-7 oui-bg-transparent oui-p-0 oui-opacity-50 hover:oui-opacity-100"
        ),
        nav_button_previous: "oui-absolute oui-left-1",
        nav_button_next: "oui-absolute oui-right-1",
        table: "oui-w-full oui-border-collapse oui-space-y-1",
        head_row: "oui-flex",
        head_cell:
          "oui-text-muted-foreground oui-rounded-md oui-w-8 oui-font-normal oui-text-[0.8rem]",
        row: "oui-flex oui-w-full oui-mt-2",
        cell: cnBase(
          "oui-relative oui-p-0 oui-text-center oui-text-sm focus-within:oui-relative focus-within:oui-z-20 [&:has([aria-selected])]:oui-bg-accent [&:has([aria-selected].day-outside)]:oui-bg-accent/50 [&:has([aria-selected].day-range-end)]:oui-rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:oui-rounded-r-md [&:has(>.day-range-start)]:oui-rounded-l-md first:[&:has([aria-selected])]:oui-rounded-l-md last:[&:has([aria-selected])]:oui-rounded-r-md"
            : "[&:has([aria-selected])]:oui-rounded-md"
        ),
        day: cnBase(
          buttonVariants({ variant: "text" }),
          "oui-h-8 oui-w-8 oui-p-0 oui-font-normal aria-selected:oui-opacity-100"
        ),
        day_range_start: "oui-day-range-start",
        day_range_end: "oui-day-range-end",
        day_selected:
          "oui-bg-primary oui-text-primary-foreground hover:oui-bg-primary hover:oui-text-primary-foreground focus:oui-bg-primary focus:oui-text-primary-foreground",
        day_today: "oui-bg-accent oui-text-accent-foreground",
        day_outside:
          "day-outside oui-text-muted-foreground oui-opacity-50  aria-selected:oui-bg-accent/50 aria-selected:oui-text-muted-foreground aria-selected:oui-opacity-30",
        day_disabled: "oui-text-muted-foreground oui-opacity-50",
        day_range_middle:
          "aria-selected:oui-bg-accent aria-selected:oui-text-accent-foreground",
        day_hidden: "oui-invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => (
          <ChevronLeftIcon size={16} className="oui-text-inherit" />
        ),
        IconRight: ({ ...props }) => (
          <ChevronRightIcon size={16} className="oui-text-inherit" />
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
