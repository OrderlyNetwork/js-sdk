import { differenceInDays, setHours } from "date-fns";

export const parseDateRangeForFilter = (dateRange: {
  from: Date;
  to?: Date;
}) => {
  let { from, to } = dateRange;

  if (typeof to === "undefined") {
    to = new Date();
  }

  const diff = differenceInDays(from, to);

  // console.log("diff", diff);

  if (diff === 0) {
    return [from, setHours(to, 23)];
  }

  return [from, to];
};
