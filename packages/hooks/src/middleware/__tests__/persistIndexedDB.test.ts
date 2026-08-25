import { adaptToStateStorage } from "../persistIndexedDB";

describe("adaptToStateStorage", () => {
  const createStorage = () => ({
    getItem: jest.fn(),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  });

  describe("setItem", () => {
    it("replaces data when state is an array", async () => {
      const storage = createStorage();
      const adapter = adaptToStateStorage(storage);

      await adapter.setItem(
        "orderly-store",
        JSON.stringify({ state: [{ id: 1 }], version: 0 }),
      );

      expect(storage.setItem).toHaveBeenCalledWith([{ id: 1 }]);
      expect(storage.removeItem).not.toHaveBeenCalled();
    });

    it("clears storage when state is null", async () => {
      const storage = createStorage();
      const adapter = adaptToStateStorage(storage);

      await adapter.setItem(
        "orderly-store",
        JSON.stringify({ state: null, version: 0 }),
      );

      expect(storage.removeItem).toHaveBeenCalled();
      expect(storage.setItem).not.toHaveBeenCalled();
    });

    it("skips the write when the state key is absent (error-path fallback)", async () => {
      const storage = createStorage();
      const adapter = adaptToStateStorage(storage);

      // zustand's JSON.stringify drops undefined values, so a partialized
      // state of undefined produces a payload without the `state` key
      await adapter.setItem("orderly-store", JSON.stringify({ version: 0 }));

      expect(storage.setItem).not.toHaveBeenCalled();
      expect(storage.removeItem).not.toHaveBeenCalled();
    });
  });
});
