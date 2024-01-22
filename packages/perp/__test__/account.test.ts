import { MMR, extractSymbols, maxQty, maxQtyByLong } from "../src/account"; // Update the path to your source file

describe("extractSymbols", () => {
  it("should extract unique symbols from positions and orders", () => {
    const positions = [
      { symbol: "AAPL" },
      { symbol: "GOOGL" },
      { symbol: "AAPL" }, // Duplicate symbol
    ];

    const orders = [{ symbol: "GOOGL" }, { symbol: "MSFT" }];

    const symbols = extractSymbols(positions, orders);

    expect(symbols).toEqual(expect.arrayContaining(["AAPL", "GOOGL", "MSFT"]));
    expect(symbols).toHaveLength(3);
  });

  // it("maxQty", () => {
  //   const qty = maxQtyByLong({
  //     baseMaxQty: 71500,
  //     totalCollateral: 2952.013334,
  //     otherIMs: 231.4123,
  //     maxLeverage: 4,
  //     baseIMR: 0.1,
  //     takerFeeRate: 10,
  //     markPrice: 1.25,
  //     positionQty: 12,
  //     buyOrdersQty: 0,
  //     sellOrdersQty: 0,
  //     symbol: "BTCUSDT",
  //     IMR_Factor: 0.0000048045,
  //   });

  //   // Add your assertions here
  // });

  // it("should handle empty positions and orders arrays", () => {
  //   const positions = [];
  //   const orders = [];

  //   const symbols = extractSymbols(positions, orders);

  //   expect(symbols).toEqual([]);
  // });
});

describe("MMR", () => {
  it("should return null if the user does not have any positions", () => {
    const inputs = {
      positionsNotional: 0,
      positionsMMR: 100,
    };

    const result = MMR(inputs);

    expect(result).toBeNull();
  });

  it("should calculate MMR correctly", () => {
    const inputs = {
      positionsNotional: 10112.43,
      positionsMMR: 505.61,
    };

    const result = MMR(inputs);

    expect(result).toBe(0.04999886278570037);
  });
});
