import * as amplitude from "@amplitude/analytics-browser";
import { EnumTrackerKeys, TrackerListenerKeyMap } from "@orderly.network/types";
import { SimpleDI } from "@orderly.network/core";
import { EventEmitter } from "@orderly.network/core";
export enum ENVType {
  prod = 'prod',
  staging = 'staging',
  qa = 'qa',
  dev = 'dev',
}
const apiKeyMap = {
  dev: "4d6b7db0fdd6e9de2b6a270414fd51e0",
  qa: "96476b00bc2701360f9b480629ae5263",
  staging: "dffc00e003479b86d410c448e00f2304",
  prod: "3ab9ae56ed16cc57bc2ac97ffc1098c2",
};



export class AmplitudeTracker {
  static instanceName = "amplitudeTracker";
  private _userId: string | undefined;
  private _sdkInfoTag: string | undefined;
  private _ee = SimpleDI.get<EventEmitter>("EE");
  constructor(env: ENVType, sdkInfo: any) {
    amplitude.init(apiKeyMap[env], { serverZone: "EU" });
    this.setSdkInfo(sdkInfo);
    this._bindEvents();
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
    amplitude.track(TrackerListenerKeyMap[eventName], properties);
  }

  private _bindEvents() {
    const listenKeys = Object.keys(TrackerListenerKeyMap);
    listenKeys.forEach((key) => {
      this._ee.addListener(key, (params = {}) => {
        if (key === EnumTrackerKeys.trackIdentifyUserId) {
          this.setUserId(params);
        } else {
          this.track(key as keyof typeof TrackerListenerKeyMap, params);
        }
      });
    });
  }
}
