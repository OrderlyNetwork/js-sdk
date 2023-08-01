interface ConfiguarationProvider {
  getAll(): any;
  getOne(key: string): any;
  set(key: string, value: any): void;
}
