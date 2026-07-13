import { renderHook } from "@testing-library/react";
import { API } from "@orderly.network/types";
import { useTokenInfo } from "../useTokensInfo/tokensInfo.store";

let mockAppTokensInfo: API.Token[];
let mockMainTokensInfo: API.Token[];
let mockTestTokensInfo: API.Token[];

jest.mock("../../provider/store/mainTokenStore", () => ({
  useMainTokenStore: (selector: (state: { data: API.Token[] }) => unknown) =>
    selector({ data: mockMainTokensInfo }),
}));

jest.mock("../../provider/store/testTokenStore", () => ({
  useTestTokenStore: (selector: (state: { data: API.Token[] }) => unknown) =>
    selector({ data: mockTestTokensInfo }),
}));

jest.mock("../appStore", () => ({
  useAppStore: (selector: (state: { tokensInfo: API.Token[] }) => unknown) =>
    selector({ tokensInfo: mockAppTokensInfo }),
}));

const createToken = (token: string, chainId: string): API.Token =>
  ({
    token,
    chain_details: [{ chain_id: chainId }],
  }) as API.Token;

describe("useTokenInfo", () => {
  const appToken = createToken("USDC", "1");
  const mainnetToken = createToken("USDC", "42161");
  const testnetToken = createToken("USDC", "99999");

  beforeEach(() => {
    mockAppTokensInfo = [appToken];
    mockMainTokensInfo = [mainnetToken];
    mockTestTokensInfo = [testnetToken];
  });

  it("uses testnet token data when networkId is testnet", () => {
    const { result } = renderHook(() => useTokenInfo("USDC", "testnet"));

    expect(result.current).toBe(testnetToken);
  });

  it("uses mainnet token data when networkId is mainnet", () => {
    const { result } = renderHook(() => useTokenInfo("USDC", "mainnet"));

    expect(result.current).toBe(mainnetToken);
  });

  it("uses app token data when networkId is omitted", () => {
    const { result } = renderHook(() => useTokenInfo("USDC"));

    expect(result.current).toBe(appToken);
  });
});
