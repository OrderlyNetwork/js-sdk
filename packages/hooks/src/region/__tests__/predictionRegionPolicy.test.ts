import { renderHook } from "@testing-library/react-hooks";
import { useQuery } from "../../useQuery";
import {
  type PredictionRegionRestriction,
  useRestrictedInfo,
} from "../../useRestrictedInfo";

jest.mock("../../useQuery", () => ({ useQuery: jest.fn() }));

const useQueryMock = useQuery as jest.Mock;

test("Prediction policy passes through without altering site-wide restrictions", () => {
  useQueryMock.mockReturnValue({ data: undefined });
  const { result, rerender } = renderHook(
    ({ policy }: { policy?: PredictionRegionRestriction }) =>
      useRestrictedInfo({ predictionRegionRestriction: policy }),
    {
      initialProps: {
        policy: undefined as PredictionRegionRestriction | undefined,
      },
    },
  );
  expect(result.current.predictionRegionRestriction).toBeUndefined();
  const policy: PredictionRegionRestriction = {
    enableDefault: false,
    customRestrictedRegions: ["Singapore"],
  };
  rerender({ policy });
  expect(result.current.predictionRegionRestriction).toBe(policy);
  expect(result.current.restrictedOpen).toBe(false);
  rerender({ policy: {} });
  expect(result.current.predictionRegionRestriction).toEqual({});
  rerender({ policy: undefined });
  expect(result.current.predictionRegionRestriction).toBeUndefined();
});
