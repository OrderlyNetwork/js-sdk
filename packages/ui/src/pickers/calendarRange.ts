import { addMonths, isAfter } from "date-fns";

export function isWithinCalendarMonths(from: Date, to: Date, months: number) {
  const start = from <= to ? from : to;
  const end = from <= to ? to : from;
  return !isAfter(end, addMonths(start, months));
}
