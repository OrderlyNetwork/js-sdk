import { Card } from "./card";
import { OrderBookComponent } from "./orderbook";

export const Components = () => {
  return (
    <div className="grid grid-cols-4">
      <div>Components</div>
      <div>
        <Card>
          <OrderBookComponent />
        </Card>
      </div>
    </div>
  );
};
