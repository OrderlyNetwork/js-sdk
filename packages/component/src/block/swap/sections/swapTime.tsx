export const SwapTime = ({ time }: { time: number }) => {
  return (
    <div className="flex justify-between text-sm mt-3">
      <span className="text-base-contrast/50">Average swap time</span>
      <span>{`~ ${time} mins`}</span>
    </div>
  );
};
