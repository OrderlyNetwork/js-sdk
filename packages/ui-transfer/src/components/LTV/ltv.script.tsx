export const useLtvScript = () => {
  return {
    from: 0,
    to: 80, // Example value
  };
};

export type LtvScriptReturns = ReturnType<typeof useLtvScript>;
