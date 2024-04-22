import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/popover"
import { cn } from "@/utils"
import { CalendarIcon } from "./sections/calendarIcon";
import { Calendar, CalendarProps } from "./calendar";
import { format, addDays, subDays } from "date-fns";
import { ArrowDown } from "./sections/arrowIcon";

export type DateRange = {
  from?: Date,
  to?: Date,
};

export const DatePicker: React.FC<{
  initDate?: DateRange,
  triggerClassName?: string,
  trigger?: React.ReactNode,
  onDateUpdate?: (dateInfo: any) => void,
  numberOfMonths?: number,
} & CalendarProps> = (props) => {
  const {
    triggerClassName,
    className,
    initDate,
    trigger,
    onDateUpdate,
    numberOfMonths = 2,
    ...rest
  } = props;
  const [date, setDate] = React.useState<DateRange | undefined>(initDate || {
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (initDate) {
      setDate(initDate);
    }
  }, [initDate]);

  const dateText = React.useMemo(() => {

    if (typeof date?.from !== 'undefined') {
      return `${format(date.from, "yyyy/MM/dd")}${` - ${format(date.to || date.from, "yyyy/MM/dd")}`}`;
    }
    return 'select date';

  }, [date]);

  const triggerView = React.useMemo((): React.ReactNode => {

    return trigger || <div
      id="orderly-data-picker-trigger"
      className={cn("orderly-cursor-pointer orderly-flex orderly-gap-2 orderly-items-center orderly-h-[24px] orderly-text-3xs orderly-text-base-contrast-54 orderly-justify-start orderly-text-left orderly-px-2 orderly-py-2 orderly-bg-base-600 orderly-fill-base-contrast-54 hover:orderly-text-base-contrast-80", triggerClassName)}
    >
      <CalendarIcon fillOpacity={1} fill="current" className="orderly-fill-base-contrast-54 hover:orderly-fill-white/80" />
      {dateText}
      <ArrowDown fillOpacity={1} className="orderly-fill-base-contrast-54 hover:orderly-fill-white/80" />
    </div>;
  }, [trigger, triggerClassName, date]);

  return (
    <div className={cn("orderly-grid orderly-gap-2", className)}>
      <Popover open={open} onOpenChange={(open) => {
        if (!open) {

        }
        setOpen(open);
      }}>
        <PopoverTrigger asChild>
          {triggerView}
        </PopoverTrigger>
        <PopoverContent className="orderly-w-auto orderly-p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            // @ts-ignore
            selected={date}
            // @ts-ignore
            onSelect={(date) => {
              onDateUpdate?.(date);
              // @ts-ignore
              setDate(date);
            }}
            fromYear={2024}
            numberOfMonths={numberOfMonths}
            {...rest}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
