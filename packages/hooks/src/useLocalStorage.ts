// https://usehooks-ts.com/react-hook/use-local-storage
import { useCallback, useEffect, useState } from "react";
import { parseJSON } from "./utils/json";

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: {
    parseJSON: typeof parseJSON;
  } = {
    parseJSON: parseJSON,
  },
): [any, (value: T) => void] {
  // Get from local storage then
  // parse stored json or return initialValue
  const readValue = useCallback((): T => {
    // Prevent build error "window is undefined" but keeps working
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (options.parseJSON(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  }, [initialValue, key, options.parseJSON]);

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [stored, setStored] = useState(() => ({ key, value: readValue() }));
  // Resolve a new key during render so the old scope is never exposed for a frame.
  const storedValue = stored.key === key ? stored.value : readValue();
  const setStoredValue = useCallback(
    (value: T) => {
      setStored((previous) =>
        previous.key === key && Object.is(previous.value, value)
          ? previous
          : { key, value },
      );
    },
    [key],
  );

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue: React.Dispatch<T> = useCallback(
    (value: T) => {
      // Prevent build error "window is undefined" but keeps working
      if (typeof window === "undefined") {
        console.warn(
          `Tried setting localStorage key “${key}” even though environment is not a client`,
        );
      }

      try {
        // Allow value to be a function so we have the same API as useState
        const newValue = value instanceof Function ? value(readValue()) : value;

        // Save to local storage
        window.localStorage.setItem(key, JSON.stringify(newValue));
        // dispath event
        window.dispatchEvent(new Event("storage"));

        // Save state
        setStoredValue(newValue);

        // We dispatch a custom event so every useLocalStorage hook are notified
        // window.dispatchEvent(new Event('local-storage'))
      } catch (error) {
        console.warn(`Error setting localStorage key “${key}”:`, error);
      }
    },
    [key, storedValue],
  );

  useEffect(() => {
    setStoredValue(readValue());
  }, [key]);

  // const handleStorageChange = useCallback(
  //   (event: StorageEvent | CustomEvent) => {
  //     if ((event as StorageEvent)?.key && (event as StorageEvent).key !== key) {
  //       return
  //     }
  //     setStoredValue(readValue())
  //   },
  //   [key, readValue],
  // )

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent | CustomEvent) => {
      if ((event as StorageEvent)?.key && (event as StorageEvent).key !== key) {
        return;
      }
      setStoredValue(readValue());
    };

    window?.addEventListener?.("storage", handleStorageChange);

    return () => {
      window?.removeEventListener?.("storage", handleStorageChange);
    };
  }, [key, readValue, setStoredValue]);

  return [storedValue, setValue];
}
