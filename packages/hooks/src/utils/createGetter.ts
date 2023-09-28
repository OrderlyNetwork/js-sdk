type objectDepth = 1 | 2;

type propertyType<T, K, F> = T extends 1 ? K : F;

// type Getter = {
//   [P in propertyType<typeof depth, K, string>]: (
//     key: K,
//     defaultValue: any
//   ) => any;
// }

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
      // console.log("getter", property, receiver);
      // if (property === "isLoading") return isLoading;
      if (depth === 1) {
        //   return data[property];
        return (defaultValue: any) => {
          if (!target) return defaultValue;
          return target[property] ?? defaultValue;
        };
      }
      return (key: K, defaultValue: any) => {
        // console.log("getter", property, key, defaultValue, data);
        if (key) {
          return (target as any)[property]?.[key] ?? defaultValue;
        } else {
          return target[property];
        }

        // return data[value][property];
      };
    },
  });
}
