import * as amplitude from "@amplitude/analytics-browser";
import { ENVType } from "../trading-rewards/useGetEnv";
import { TrackerListenerKeyMap } from "@orderly.network/types";

const apiKeyMap = {
  dev: "4d6b7db0fdd6e9de2b6a270414fd51e0",
  qa: "96476b00bc2701360f9b480629ae5263",
  staging: "dffc00e003479b86d410c448e00f2304",
  prod: "3ab9ae56ed16cc57bc2ac97ffc1098c2",
};

export interface IAmplitude {
  init(env: ENVType): void;
  setUserId(userId: string): void;
  identify(identify: any): void;
  track(eventName: string, properties?: any): void;
}

class AmplitudeTracker implements IAmplitude {
  private initialized = false;
  private _userId: string | undefined;
  private _sdkInfoTag: string | undefined;

  init(env: ENVType) {
    if (this.initialized) return;
    
    amplitude.init(apiKeyMap[env], { serverZone: "EU" });
    this.initialized = true;
  }

  setUserId(userId: string) {
    if (userId === this._userId) {
      return;
    }
    amplitude.setUserId(userId);
    this._userId = userId;
  }

  setSdkInfo(sdkInfo: any) {
    if (this._sdkInfoTag && sdkInfo.address === this._sdkInfoTag) return;
    const identify = new amplitude.Identify();
    Object.entries(sdkInfo).forEach(([key, value]) => {
      identify.set(key, value as string);
    });
    amplitude.identify(identify);
    this._sdkInfoTag = sdkInfo.address;
  }

  identify(identifyEvent: any) {
    amplitude.identify(identifyEvent);
  }

  track(eventName: keyof typeof TrackerListenerKeyMap, properties?: any) {
    amplitude.track(eventName, properties);
  }
}

// 创建单例
export const amplitudeTracker = new AmplitudeTracker(); 