import { SimpleDI } from "@orderly.network/core";

const CHECK_ENTRY: Record<string, boolean> = { chains_fetch: false };

export class AppState {
  static instanceName = "AppState";
  _ready: boolean;
  _errors: any[];
  _appState: any;
  _exchangeStatus: any;
  constructor() {
    this._ready = false;
    this._errors = [];
    // this._appState = SystemStateEnum.LOADING;
    // this._exchangeStatus = ExchangeStatusEnum.NORMAL;
  }

  onAppTestChange(name: string) {
    CHECK_ENTRY[name] = true;
    const isReady = Object.keys(CHECK_ENTRY).every((key) => CHECK_ENTRY[key]);

    if (isReady) {
      console.log("change app ready: true");
      //   setReady(true);
      this._ready = true;
    }
  }

  get ready() {
    return this._ready;
  }
  get errors() {
    return this._errors;
  }
  get appState() {
    return this._appState;
  }
  get exchangeStatus() {
    return this._exchangeStatus;
  }
  async init() {
    // const appState = await getAppState();
    // this._ready = true;
    // this._appState = appState.appState;
    // this._exchangeStatus = appState.exchangeStatus;
  }
}

export const appStateInstance = SimpleDI.registerByName(
  AppState.instanceName,
  new AppState()
);
