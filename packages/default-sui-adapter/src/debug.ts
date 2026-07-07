type LogLevel = "info" | "warn" | "error";

const snapshotReplacer = () => {
  const seen = new WeakSet<object>();

  return (_key: string, value: unknown) => {
    if (typeof value === "bigint") {
      return value.toString();
    }

    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack,
        cause: value.cause,
      };
    }

    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "[Circular]";
      }
      seen.add(value);
    }

    if (typeof value === "undefined") {
      return null;
    }

    return value;
  };
};

export const stringifyLogSnapshot = (value: unknown) => {
  try {
    return JSON.stringify(value, snapshotReplacer());
  } catch (error) {
    return JSON.stringify({
      snapshotError: error instanceof Error ? error.message : String(error),
    });
  }
};

export const logSnapshot = (level: LogLevel, label: string, value: unknown) => {
  void level;
  void label;
  void value;
  // console[level](`${label} ${stringifyLogSnapshot(value)}`);
};
