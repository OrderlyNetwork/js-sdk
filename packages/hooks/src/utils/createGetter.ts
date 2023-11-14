type objectDepth = 1 | 2;
type propertyType<T, K, F> = T extends 1 ? K : F;

export function createGetter<
  T extends Record<string, any>,
  K extends keyof T = string
>(data: T, depth: objectDepth = 2) {
  return new Proxy(data || {}, {
    get(
      target: any,
      property: propertyType<typeof depth, K, any>,
      receiver
    ): any {
      if (depth === 1) {
        return (defaultValue: any) => {
          if (!target) return defaultValue;
          return target[property] ?? defaultValue;
        };
      }
      return (key: K, defaultValue: any) => {
        if (key) {
          return (target as any)[property]?.[key] ?? defaultValue;
        } else {
          return target[property];
        }
      };
    },
  });
}
