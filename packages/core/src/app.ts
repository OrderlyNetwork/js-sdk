import { AsyncSubject } from "rxjs";

export class App {
  state$ = new AsyncSubject();

  private prepare = ["symbolInfo", "clientInfo"];

  updateState(name: string) {
    this.prepare = this.prepare.filter((item) => item !== name);

    this.state$.next(name);

    if (this.prepare.length === 0) {
      // this.state$.next("ready")
      this.state$.complete();
    }
  }
}
