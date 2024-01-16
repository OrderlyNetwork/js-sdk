export const SwapTime = ({ time }: { time: number }) => {
  return (
    <div className="orderly-flex orderly-justify-between orderly-text-2xs desktop:orderly-text-xs orderly-mt-3">
      <span className="orderly-text-base-contrast-54">Average swap time</span>
      <span>{`~ ${time} mins`}</span>
    </div>
  );
};
