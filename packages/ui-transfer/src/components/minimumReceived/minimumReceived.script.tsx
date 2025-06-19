// import React from "react";

export const useMinimumReceivedScript = () => {
  return {
    minimumReceived: 642.165, // Example value
    type: "USDC", // Example type
  };
};

export type MinimumReceivedReturns = ReturnType<
  typeof useMinimumReceivedScript
>;
