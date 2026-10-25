import { TradingViewSDKLocalstorageKey } from "./common.util";
import {
  defaultDisplayControlSetting,
  getDisplayControlSetting,
} from "./displayControlSetting";

const key = TradingViewSDKLocalstorageKey.displayControlSetting;

describe("getDisplayControlSetting", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns the defaults when nothing is saved", () => {
    expect(getDisplayControlSetting()).toEqual(defaultDisplayControlSetting);
  });

  it("keeps saved choices and enables options missing from older settings", () => {
    localStorage.setItem(
      key,
      JSON.stringify({
        position: false,
        buySell: true,
        limitOrders: false,
        stopOrders: true,
        tpsl: true,
      }),
    );

    expect(getDisplayControlSetting()).toEqual({
      ...defaultDisplayControlSetting,
      position: false,
      limitOrders: false,
    });
  });

  it.each(["{invalid", "null", "[]", '"text"'])(
    "falls back to the defaults for invalid saved data (%s)",
    (value) => {
      localStorage.setItem(key, value);
      expect(getDisplayControlSetting()).toEqual(defaultDisplayControlSetting);
    },
  );

  it("ignores non-boolean values", () => {
    localStorage.setItem(key, JSON.stringify({ tpsl: "false" }));
    expect(getDisplayControlSetting().tpsl).toBe(true);
  });
});
