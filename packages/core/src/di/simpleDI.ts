import Container from "./container";

//https://github.com/kl4n4/typescript-simple-di
export class SimpleDI {
  private static container: Container;

  private static getContainer(): Container {
    if (!SimpleDI.container) {
      SimpleDI.container = new Container();
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

  // static getByType<T>(c: new (...args: any[]) => T): T {
  //     return this.getContainer().getByType(c);
  // }

  static getAll(): { [name: string]: any } {
    return this.getContainer().getAll();
  }

  private constructor() {}
}

export default SimpleDI;
