import { BehaviorSubject } from "rxjs";

class NetStateObserver {
  public subject: BehaviorSubject<any>;
  constructor() {
    this.subject = new BehaviorSubject<any>(null);

    this.bindEvents();
  }

  private bindEvents() {
    // add net state change event listener to browser
  }

  get state() {
    return this.subject.value;
  }
}

export default new NetStateObserver();
