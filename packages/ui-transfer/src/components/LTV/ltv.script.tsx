export const useLtvScript = () => {
  return {
    from: 50,
    to: 0, // Example value
  };
};

export type LtvScriptReturns = ReturnType<typeof useLtvScript>;
