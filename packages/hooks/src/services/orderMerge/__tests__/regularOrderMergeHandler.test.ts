import { API, WSMessage } from "@orderly.network/types";
import { RegularOrderMergeHandler } from "../regularOrderMergeHandler";

describe("Regular order creation priority", () => {
  it.each(["REPLACED", "FILLED"])(
    "preserves creation time on %s updates lacking createdTime",
    (status) => {
      const previous = [
        {
          meta: { total: 1 },
          rows: [
            {
              order_id: 1,
              created_time: 100,
              quantity: 100,
              total_executed_quantity: 0,
            },
          ],
        },
      ] as API.OrderResponse[];
      const message = {
        orderId: 1,
        status,
        timestamp: 200,
        quantity: 100,
        totalExecutedQuantity: 20,
      } as WSMessage.Order;
      const handler = new RegularOrderMergeHandler(message);
      // The base formatter has already synthesized a creation time.
      expect(handler.data.created_time).toBe(200);
      const updated = handler.merge("orders:INCOMPLETE", message, previous);
      expect(updated[0].rows[0]).toMatchObject({
        created_time: 100,
        timestamp: 200,
        total_executed_quantity: 20,
      });
      expect(previous[0].rows[0].total_executed_quantity).toBe(0);
    },
  );

  it("uses the event timestamp for newly inserted orders", () => {
    const message = {
      orderId: 1,
      status: "NEW",
      timestamp: 200,
    } as WSMessage.Order;
    const handler = new RegularOrderMergeHandler(message);
    const updated = handler.merge("orders:INCOMPLETE", message, [
      { meta: { total: 0 }, rows: [] },
    ] as API.OrderResponse[]);
    expect(updated[0].rows[0].created_time).toBe(200);
  });

  it("treats a zero creation time as missing, matching the base formatter", () => {
    const message = {
      orderId: 1,
      status: "REPLACED",
      timestamp: 200,
      createdTime: 0,
    } as unknown as WSMessage.Order;
    const handler = new RegularOrderMergeHandler(message);
    const updated = handler.merge("orders:INCOMPLETE", message, [
      { meta: { total: 1 }, rows: [{ order_id: 1, created_time: 100 }] },
    ] as API.OrderResponse[]);
    expect(updated[0].rows[0].created_time).toBe(100);
  });

  it("keeps an authoritative creation time explicitly present in the update", () => {
    const message = {
      orderId: 1,
      status: "REPLACED",
      timestamp: 300,
      createdTime: 150,
    } as unknown as WSMessage.Order;
    const handler = new RegularOrderMergeHandler(message);
    const updated = handler.merge("orders:INCOMPLETE", message, [
      { meta: { total: 1 }, rows: [{ order_id: 1, created_time: 100 }] },
    ] as API.OrderResponse[]);
    expect(updated[0].rows[0].created_time).toBe(150);
  });
});
