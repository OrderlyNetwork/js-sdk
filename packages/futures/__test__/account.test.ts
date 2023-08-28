import { extractSymbols } from "../src/account"; // Update the path to your source file

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

  it("should handle empty positions and orders arrays", () => {
    const positions = [];
    const orders = [];

    const symbols = extractSymbols(positions, orders);

    expect(symbols).toEqual([]);
  });
});
