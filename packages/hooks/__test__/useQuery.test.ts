import { renderHook } from "@testing-library/react-hooks";
import { useQuery } from "../src";
import { FundingRate } from "../src/apis/useFundingRateBySymbol";

test("useQuery", async () => {
  const { result, waitForValueToChange } = renderHook(() => {
    return useQuery<FundingRate>("/public/funding_rate");
  });

  await waitForValueToChange(() => result.current.data, {
    timeout: 5000,
  });

  console.log(result.current.data);

  expect(result.current.data).toBeUndefined();
});
