import { act, cleanup, renderHook } from "@testing-library/react";
import { useLocalStorage } from "../src/useLocalStorage";

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe("useLocalStorage scope changes", () => {
  it("writes to the new key even when both cached values are identical", () => {
    localStorage.setItem("a", "false");
    localStorage.setItem("b", "false");
    const { result, rerender } = renderHook(
      ({ key }) => useLocalStorage(key, false),
      { initialProps: { key: "a" } },
    );
    rerender({ key: "b" });
    act(() => result.current[1](true));
    expect(localStorage.getItem("a")).toBe("false");
    expect(localStorage.getItem("b")).toBe("true");
  });
  it("never exposes the previous scope value while rendering a new key", () => {
    localStorage.setItem("a", "true");
    localStorage.setItem("b", "false");
    const renders: Array<[string, boolean]> = [];
    const { rerender } = renderHook(
      ({ key }) => {
        const value = useLocalStorage(key, false);
        renders.push([key, value[0]]);
        return value;
      },
      { initialProps: { key: "a" } },
    );
    rerender({ key: "b" });
    expect(
      renders.filter(([key]) => key === "b").every(([, value]) => !value),
    ).toBe(true);
  });
  it("applies consecutive functional updates to the latest persisted value", () => {
    const { result } = renderHook(() =>
      useLocalStorage<number | ((value: number) => number)>("counter", 0),
    );
    act(() => {
      result.current[1]((value) => value + 1);
      result.current[1]((value) => value + 1);
    });
    expect(result.current[0]).toBe(2);
    expect(localStorage.getItem("counter")).toBe("2");
  });
  it("tracks external storage changes without writing them back", () => {
    const { result, rerender } = renderHook(
      ({ key }) => useLocalStorage(key, false),
      { initialProps: { key: "a" } },
    );
    rerender({ key: "b" });
    localStorage.setItem("b", "true");
    const writes = jest.spyOn(Storage.prototype, "setItem");
    act(() => window.dispatchEvent(new StorageEvent("storage", { key: "b" })));
    expect(result.current[0]).toBe(true);
    expect(writes).not.toHaveBeenCalled();
    writes.mockRestore();
  });
});
