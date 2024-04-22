import * as React from "react"
// import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons"
import { cn } from "@/utils"
import { DayPicker } from "react-day-picker";
import { ArrowLeft, ArrowRight } from "./sections/arrowIcon";


export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("orderly-p-4", className)}
      classNames={{
        months: "orderly-flex orderly-flex-col desktop:orderly-flex-row orderly-gap-5",
        month: "orderly-space-y-4",
        caption: "orderly-flex orderly-justify-center orderly-pt-1 orderly-relative orderly-items-center",
        caption_label: "orderly-text-sm orderly-font-medium",
        nav: "orderly-space-x-1 orderly-flex orderly-items-center",
        nav_button: cn(
        //   buttonVariants({ variant: "outline" }),
          "orderly-h-7 orderly-w-7 orderly-bg-transparent orderly-p-0 orderly-opacity-50 hover:orderly-opacity-100"
        ),
        nav_button_previous: "orderly-absolute orderly-left-1",
        nav_button_next: "orderly-absolute orderly-right-1 orderly-flex orderly-justify-end orderly-items-center",
        table: "orderly-w-full orderly-border-collapse orderly-space-y-1",
        head_row: "orderly-flex",
        head_cell:
          "orderly-text-muted-foreground orderly-rounded-md orderly-w-8 orderly-font-normal orderly-text-[0.8rem] orderly-text-base-contrast-54",
        row: "orderly-flex orderly-w-full orderly-mt-2",
        cell: cn(
          "orderly-relative orderly-p-0 orderly-text-center orderly-text-sm focus-within:orderly-relative focus-within:orderly-z-20 [&:has([aria-selected])]:orderly-bg-accent [&:has([aria-selected].day-outside)]:orderly-bg-accent/50 [&:has([aria-selected].day-range-end)]:orderly-rounded-r-md orderly-rounded-sm",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:orderly-rounded-r-md [&:has(>.day-range-start)]:orderly-rounded-l-md first:[&:has([aria-selected])]:orderly-rounded-l-md last:[&:has([aria-selected])]:orderly-rounded-r-md"
            : "[&:has([aria-selected])]:orderly-rounded-md"
        ),
        day: cn(
        //   buttonVariants({ variant: "ghost" }),
          "orderly-h-8 orderly-w-8 orderly-p-0 orderly-font-normal aria-selected:orderly-opacity-100 orderly-text-base-contrast-80 hover:orderly-bg-base-500"
        ),
        day_range_start: "day-range-start orderly-rounded-l-sm !orderly-bg-base-200",
        day_range_end: "day-range-end orderly-rounded-r-sm !orderly-bg-base-200",
        day_selected:
          "orderly-bg-base-400 ",
        day_today: "orderly-bg-accent ",
        day_outside:
          "orderly-day-outside orderly-text-muted-foreground orderly-opacity-50 aria-selected:orderly-bg-accent/50 aria-selected:orderly-text-muted-foreground aria-selected:orderly-opacity-30",
        day_disabled: "orderly-text-muted-foreground orderly-opacity-50",
        day_range_middle:
          "aria-selected:orderly-bg-accent aria-selected:orderly-text-accent-foreground",
        day_hidden: "orderly-invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ArrowLeft fillOpacity={1} className="orderly-fill-white-[.54] hover:orderly-fill-white/80"/>,
        IconRight: ({ ...props }) => <ArrowRight fillOpacity={1} className="orderly-fill-white-[.54] hover:orderly-fill-white/80"/>,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
