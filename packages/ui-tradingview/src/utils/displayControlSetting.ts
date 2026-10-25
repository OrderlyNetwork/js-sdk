import { DisplayControlSettingInterface } from "../type";
import { TradingViewSDKLocalstorageKey } from "./common.util";

export const defaultDisplayControlSetting: DisplayControlSettingInterface = {
  position: true,
  buySell: true,
  limitOrders: true,
  stopOrders: true,
  tpsl: true,
  positionTpsl: true,
  trailingStop: true,
  liquidationPrice: true,
};

/**
 * Read the saved display setting and merge it with the defaults, so options
 * added after the setting was saved stay enabled and invalid data falls back
 * to the defaults.
 */
export const getDisplayControlSetting = (): DisplayControlSettingInterface => {
  try {
    const saved = JSON.parse(
      localStorage.getItem(
        TradingViewSDKLocalstorageKey.displayControlSetting,
      ) ?? "null",
    );

    if (!saved || typeof saved !== "object" || Array.isArray(saved)) {
      return { ...defaultDisplayControlSetting };
    }

    const setting = { ...defaultDisplayControlSetting };
    (Object.keys(setting) as (keyof DisplayControlSettingInterface)[]).forEach(
      (key) => {
        if (typeof saved[key] === "boolean") {
          setting[key] = saved[key];
        }
      },
    );
    return setting;
  } catch {
    return { ...defaultDisplayControlSetting };
  }
};
