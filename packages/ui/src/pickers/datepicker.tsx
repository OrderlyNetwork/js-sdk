import { FC, useMemo } from "react";
import { Popover } from "../popover/popover";
import { Calendar } from "./date/calendar";
import { selectVariants } from "../select/selectPrimitive";
import { CalendarIcon } from "../icon/calendar";
import { CaretDownIcon } from "../icon/caretDown";
import type { SizeType } from "../helpers/sizeType";

export type DatePickerProps = {
  onChange?: (date: Date) => void;
  // selected: Date;
  placholder?: string;
  value?: Date;
  dateFormat?: string;
  size?: SizeType;
  className?: string;
};

const DatePicker: FC<DatePickerProps> = (props) => {
  const { placholder, dateFormat, onChange, value, size, className } = props;

  const { trigger } = selectVariants({ size, className });

  const foramttedValue = useMemo(() => {
    if (typeof value === "undefined") {
      return placholder ?? "Select Date";
    }
  }, [value, placholder]);

  return (
    <Popover
      contentProps={{
        className: "oui-w-auto oui-p-0",
      }}
      content={
        <Calendar
          onSelect={(date) => console.log(date)}
          selected={new Date()}
        />
      }
    >
      <button
        className={trigger({
          className: "orderly-datepicker-trigger oui-group",
        })}
      >
        <span className="orderly-datepicker-trigger-icon">
          <CalendarIcon size={14} className="oui-text-inherit" opacity={1} />
        </span>
        <span>{foramttedValue}</span>
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
