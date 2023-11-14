import { SimpleDI } from "@orderly.network/core";
import { ExchangeStatusEnum, SystemStateEnum } from "@orderly.network/types";
import { BehaviorSubject } from "rxjs";

type AppPrepareItem = "symbolInfo" | "clientInfo" | "tradingView";

export class AppState {
  static instanceName: string = "AppState";
  systemState$ = new BehaviorSubject(SystemStateEnum.Loading);
  exchangeState$ = new BehaviorSubject(ExchangeStatusEnum.Normal);

  private prepare: AppPrepareItem[] = ["symbolInfo", "clientInfo"];

  updateState(name: AppPrepareItem) {
    this.prepare = this.prepare.filter((item) => item !== name);

    if (this.prepare.length === 0) {
      // this.state$.next("ready")
      this.systemState$.next(SystemStateEnum.Ready);
    }
  }

  udpateSystemState(state: SystemStateEnum) {
    this.systemState$.next(state);
  }

  updateExchangeState(state: ExchangeStatusEnum) {
    this.exchangeState$.next(state);
  }
}

SimpleDI.registerByName(AppState.instanceName, new AppState());

export function getAppState() {
  return SimpleDI.get<AppState>(AppState.instanceName);
}
