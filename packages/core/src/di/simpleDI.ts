import { getGlobalObject } from "../utils";
import Container from "./container";

//https://github.com/kl4n4/typescript-simple-di
export class SimpleDI {
  private static KEY = "__ORDERLY_CONTAINER__";
  private static container: Container =
    (getGlobalObject() as any)[SimpleDI.KEY] || null;

  private static getContainer(): Container {
    if (!SimpleDI.container) {
      (getGlobalObject() as any)[SimpleDI.KEY] = SimpleDI.container =
        new Container();
    }
    return SimpleDI.container;
  }

  static register(...serviceClasses: any[]): void {
    this.getContainer().register(...serviceClasses);
  }

  static registerByName(name: string, serviceClass: any): void {
    this.getContainer().registerByName(name, serviceClass);
  }

  // static addInjectProperty(target: any, propertyKey: string, serviceName: string = propertyKey): void {
  //     this.getContainer().addInjectProperty(target, propertyKey, serviceName);
  // }

  static get<T = any>(name: string): T {
    return this.getContainer().get<T>(name);
  }

  static getOr<T = any>(name: string, instance: T): T {
    const s = this.getContainer().get<T>(name);
    if (!s) {
      SimpleDI.registerByName(name, instance);
    }
    return instance;
  }

  // static getByType<T>(c: new (...args: any[]) => T): T {
  //     return this.getContainer().getByType(c);
  // }

  static getAll(): { [name: string]: any } {
    return this.getContainer().getAll();
  }

  private constructor() {}
}

export default SimpleDI;
