import { expect, it, vi } from "vitest";
import { settleOrderCancellations } from "@orderly.network/hooks/src/utils/orderCancellation";

it("returns successful responses in request order", async () => {
  const responses = [{ success: true }, { success: true, data: {} }];
  expect(
    await settleOrderCancellations(
      responses.map((response) => Promise.resolve(response)),
    ),
  ).toEqual(responses);
});

it.each(["exception", "envelope"])(
  "waits for outstanding requests before reporting an %s failure",
  async (condition) => {
    let finish!: () => void;
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const completed = vi.fn();
    const first =
      condition === "exception"
        ? Promise.reject(new Error("REJECTED"))
        : Promise.resolve({ success: false, message: "REJECTED" });
    const result = settleOrderCancellations<unknown>([first, pending]).catch(
      (error) => completed(error.message),
    );
    await Promise.resolve();
    await Promise.resolve();
    expect(completed).not.toHaveBeenCalled();
    finish();
    await result;
    expect(completed).toHaveBeenCalledExactlyOnceWith("REJECTED");
  },
);

it("retains nested backend failure messages", async () => {
  await expect(
    settleOrderCancellations([
      Promise.resolve([
        { success: true },
        { success: false, message: "ALGO_REJECTED" },
      ]),
    ]),
  ).rejects.toThrow("ALGO_REJECTED");
});
