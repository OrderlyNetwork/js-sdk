import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Popover } from "../popover/popover";
import { Calendar, CalendarProps } from "./date/calendar";
import { selectVariants } from "../select/selectPrimitive";
import { CalendarIcon } from "../icon/calendar";
import { CaretDownIcon } from "../icon/caretDown";
import type { SizeType } from "../helpers/sizeType";
import { format } from "date-fns";
import { DateRange, DayPickerRangeProps } from "react-day-picker";

export type DateRangePickerProps = {
  onChange?: (date: DateRange) => void;
  // selected: Date;
  placeholder?: string;
  value?: DateRange;
  initialValue?: DateRange;
  dateFormat?: string;
  size?: SizeType;
  className?: string;
  formatString?: string;
} & Omit<DayPickerRangeProps, "mode">;

const DEFAULT_DATE_FORMAT = "yyyy/MM/dd";

const DateRangePicker: FC<DateRangePickerProps> = (props) => {
  const {
    placeholder,
    dateFormat,
    onChange,
    value,
    initialValue,
    size,
    className,
    formatString = DEFAULT_DATE_FORMAT,
    ...calendarProps
  } = props;
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | null>(
    value || initialValue || null
  );

  const [isMobileView, setIsMobileView] = useState<boolean>(false);

  const update = useDebouncedCallback((width: number) => {
    setIsMobileView(width <= 768);
  }, 100);

  // Effect hook to listen to window resize events
  useEffect(() => {
    const handleResize = () => {
      update(window.innerWidth);
    };

    setIsMobileView(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (
      value?.from &&
      value?.to &&
      dateRange?.from &&
      dateRange?.to &&
      !areDatesEqual(value as any, dateRange as any)
    )
      setDateRange(value);
  }, [value]);

  const { trigger } = selectVariants({ size, className });

  const formattedValue = useMemo(() => {
    // console.log("dateRange", dateRange);
    if (!dateRange || !dateRange.from || !dateRange.to) {
      return placeholder ?? "Select Date";
    }
    const arr = [];
    if (dateRange.from) arr.push(format(dateRange.from, formatString));
    if (dateRange.to) arr.push(format(dateRange.to, formatString));

    return `${arr.join(" - ")}`;
  }, [dateRange, placeholder]);

  const onOpenChange = (nextOpen: boolean) => {
    // console.log(dateRange);
    if (
      typeof dateRange?.to === "undefined" &&
      typeof dateRange?.from !== "undefined"
    ) {
      setDateRange({
        ...dateRange,
        to: dateRange.from,
      });
    }
    if (!nextOpen && dateRange) {
      onChange?.(dateRange);
    }
    setOpen(nextOpen);
  };

  const onSelected = (range: DateRange, date: Date) => {
    if (dateRange?.from && dateRange?.to) {
      setDateRange({
        from: date,
      });
    } else {
      setDateRange(range);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
      contentProps={{
        className: "oui-w-auto oui-p-0",
        align: "start",
      }}
      content={
        <Calendar
          numberOfMonths={isMobileView ? 1 : 2}
          {...calendarProps}
          mode={"range"}
          // @ts-ignore
          selected={dateRange}
          // @ts-ignore
          onSelect={onSelected}
        />
      }
    >
      <button
        className={trigger({
          className: "oui-datepicker-trigger oui-group",
        })}
      >
        <span className="oui-datepicker-trigger-icon">
          <CalendarIcon size={14} className="oui-text-inherit" opacity={1} />
        </span>
        <span>{formattedValue}</span>
        <CaretDownIcon
          size={12}
          className="oui-datepicker-trigger-arrow oui-text-inherit oui-transition-transform group-data-[state=open]:oui-rotate-180 group-data-[state=closed]:oui-rotate-0"
          opacity={1}
        />
      </button>
    </Popover>
  );
};

DateRangePicker.displayName = "DateRangePicker";

export { DateRangePicker };

function useDebouncedCallback(callback: any, delay: number) {
  const timeoutRef = useRef<any | null>(null);

  const debouncedCallback = useCallback(
    (args: any) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(args);
      }, delay);
    },
    [callback, delay]
  );
  return debouncedCallback;
}

function areDatesEqual(
  date1: { from: Date; to: Date },
  date2: { from: Date; to: Date }
): boolean {
  const extractDateParts = (date: Date) => ({
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
  });

  const from1 = extractDateParts(date1.from);
  const to1 = extractDateParts(date1.to);
  const from2 = extractDateParts(date2.from);
  const to2 = extractDateParts(date2.to);

  return (
    from1.year === from2.year &&
    from1.month === from2.month &&
    from1.day === from2.day &&
    to1.year === to2.year &&
    to1.month === to2.month &&
    to1.day === to2.day
  );
}
