export const SwapTime = ({ time }: { time: number }) => {
  return (
    <div className="flex justify-between text-3xs mt-3">
      <span className="text-base-contrast-54">Average swap time</span>
      <span>{`~ ${time} mins`}</span>
    </div>
  );
};
