import { useObservable } from "rxjs-hooks";

import { useMarkPricesSubject } from "./useMarkPricesSubject";

export const useMarkPriceStream = () => {
  const markPrice$ = useMarkPricesSubject();

  return useObservable(() => markPrice$, {});
};
