import { FC, useMemo, useState } from "react";
import { Popover } from "../popover/popover";
import { Calendar, CalendarProps } from "./date/calendar";
import { selectVariants } from "../select/selectPrimitive";
import { CalendarIcon } from "../icon/calendar";
import { CaretDownIcon } from "../icon/caretDown";
import type { SizeType } from "../helpers/sizeType";
import { ActiveModifiers } from "react-day-picker";
import { useLocale } from "../locale";
export type DatePickerProps = {
  onChange?: (date: Date) => void;
  // selected: Date;
  placeholder?: string;
  value?: Date;
  dateFormat?: string;
  size?: SizeType;
  className?: string;
} & CalendarProps;

const DatePicker: FC<DatePickerProps> = (props) => {
  const {
    placeholder,
    dateFormat,
    onChange,
    value,
    size,
    className,
    ...calendarProps
  } = props;

  const [locale] = useLocale("picker");

  const { trigger } = selectVariants({ size, className });

  const [open, setOpen] = useState(false);

  const formattedValue = useMemo(() => {
    if (typeof value === "undefined") {
      return placeholder ?? locale.selectDate;
    }
  }, [value, placeholder, locale]);

  const onSelect = (
    day: Date | undefined,
    selectedDay: Date,
    activeModifiers: ActiveModifiers,
    e: MouseEvent
  ) => {
    //@ts-ignore
    calendarProps.onSelect?.(day, selectedDay, activeModifiers, e);

    if (day) {
      onChange?.(day);
      setOpen(false);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      contentProps={{
        className: "oui-w-auto oui-p-0",
      }}
      // @ts-ignore
      content={<Calendar onSelect={onSelect} {...calendarProps} />}
    >
      <button
        className={trigger({
          className: "orderly-datepicker-trigger oui-group",
        })}
      >
        <span className="orderly-datepicker-trigger-icon">
          <CalendarIcon size={14} className="oui-text-inherit" opacity={1} />
        </span>
        <span>{formattedValue}</span>
        <CaretDownIcon
          size={12}
          className="orderly-datepicker-trigger-arrow oui-text-inherit oui-transition-transform group-data-[state=open]:oui-rotate-180 group-data-[state=closed]:oui-rotate-0"
          opacity={1}
        />
      </button>
    </Popover>
  );
};

DatePicker.displayName = "DatePicker";

export { DatePicker };
