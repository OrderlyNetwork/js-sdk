import { EventEmitter } from "@orderly.network/core";

class DataCenter extends EventEmitter {
    // private dataSource: any = new Map();
    //

  constructor() {
    super();
  }

  observe = (key: string, callback: (value: any) => void) => {
    // check if data exists, 
    // merge data
    this.on(key, callback);
  };

  unobserve = (key: string, callback: (value: any) => void) => {
    this.off(key, callback);
  };
}
