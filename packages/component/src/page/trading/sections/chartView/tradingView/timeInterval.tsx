const timeIntervals = [
  {
    name: "1m",
    value: "1",
  },
  {
    name: "5m",
    value: "5",
  },
  {
    name: "15m",
    value: "15",
  },
  {
    name: "30m",
    value: "30",
  },
  {
    name: "1h",
    value: "60",
  },
  {
    name: "4h",
    value: "240",
  },
  {
    name: "D",
    value: "1D",
  },
  {
    name: "W",
    value: "1W",
  },
];

export const TimeIntervals = () => {
  return (
    <div className="flex py-2">
      {timeIntervals.map((interval) => {
        return (
          <button key={interval.value} className="px-2 text-slate-400">
            {interval.name}
          </button>
        );
      })}
    </div>
  );
};
