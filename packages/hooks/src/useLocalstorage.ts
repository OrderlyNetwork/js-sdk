import { useCallback, useEffect, useState } from "react";

export const useLocalStorage = <T = any>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState(() => initialValue);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const item = localStorage.getItem(key);
    if (item) {
      setStoredValue(JSON.parse(item));
    }
  }, []);

  const set = useCallback((value: any) => {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  }, []);

  const remove = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.removeItem(key);
  }, []);

  return {
    value: storedValue,
    set,
    remove,
  };
};
