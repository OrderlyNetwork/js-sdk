import Button from "@/button";

export const PositionHeader = () => {
  return (
    <div>
      <div className="orderly-grid orderly-grid-cols-3">
        <div>Unreal. PnL</div>
        <div>Notional</div>
        <div>Unsettled PnL</div>
      </div>
      <div className="orderly-flex orderly-justify-between">
        <Button variant="outlined" size={"small"}>
          All Sides
        </Button>
        <Button variant="outlined" size={"small"}>
          Market Close All
        </Button>
      </div>
    </div>
  );
};
