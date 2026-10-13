import { renderHook } from "@testing-library/react-hooks";
import type { API } from "@orderly.network/types";
import { useQuery } from "../../useQuery";
import {
  isProductRegionRestricted,
  type ProductRegionIpInfo,
} from "../productRegion";
import { useProductRegionRestricted } from "../useProductRegionRestricted";

jest.mock("../../useQuery", () => ({
  useQuery: jest.fn(),
}));

const useQueryMock = useQuery as jest.Mock;

const areas: API.ProductRestrictedAreasResponse = {
  product_type: "BINARY",
  countries: { rows: [] },
  cities: { rows: [] },
};

describe("isProductRegionRestricted", () => {
  for (const visibility of ["visible", "hidden"] as const) {
    test(`${visibility} country rows restrict trading`, () => {
      const restricted = {
        ...areas,
        countries: { rows: [{ name: "United States", visibility }] },
      };
      expect(
        isProductRegionRestricted({
          platformAreas: restricted,
          ipInfo: { region: "UNITED_STATES" },
        }),
      ).toBe(true);
      expect(
        isProductRegionRestricted({
          platformAreas: restricted,
          ipInfo: { country: "united-states" },
        }),
      ).toBe(true);
      expect(
        isProductRegionRestricted({
          platformAreas: restricted,
          ipInfo: { region: "Canada" },
        }),
      ).toBe(false);
    });

    test(`${visibility} city rows require the matching country`, () => {
      const restricted = {
        ...areas,
        cities: {
          rows: [
            { name: "London", country_name: "United Kingdom", visibility },
          ],
        },
      };
      expect(
        isProductRegionRestricted({
          platformAreas: restricted,
          ipInfo: { region: "United Kingdom", city: "LONDON" },
        }),
      ).toBe(true);
      expect(
        isProductRegionRestricted({
          platformAreas: restricted,
          ipInfo: { region: "Canada", city: "London" },
        }),
      ).toBe(false);
      expect(
        isProductRegionRestricted({
          platformAreas: restricted,
          ipInfo: { city: "London" },
        }),
      ).toBe(false);
      expect(
        isProductRegionRestricted({
          platformAreas: restricted,
          ipInfo: { region: "United Kingdom" },
        }),
      ).toBe(false);
    });
  }

  test("an unmatched city still checks country restrictions", () => {
    expect(
      isProductRegionRestricted({
        platformAreas: {
          ...areas,
          cities: {
            rows: [
              { name: "London", country_name: "Canada", visibility: "hidden" },
            ],
          },
          countries: {
            rows: [{ name: "United Kingdom", visibility: "visible" }],
          },
        },
        ipInfo: { region: "United Kingdom", city: "London" },
      }),
    ).toBe(true);
  });

  test("missing data and an empty list do not restrict trading", () => {
    expect(
      isProductRegionRestricted({
        platformAreas: undefined,
        ipInfo: { region: "Canada" },
      }),
    ).toBe(false);
    expect(isProductRegionRestricted({ platformAreas: areas })).toBe(false);
    expect(
      isProductRegionRestricted({
        platformAreas: areas,
        ipInfo: { region: "Canada" },
      }),
    ).toBe(false);
  });

  test("custom regions match the IP region or city, normalized", () => {
    const customRegions = ["United States", "new york"];
    const byRegion: ProductRegionIpInfo = { region: "UNITED_STATES" };
    const byCity: ProductRegionIpInfo = { region: "Canada", city: "New-York" };
    const unrestricted: ProductRegionIpInfo = {
      region: "Canada",
      city: "Toronto",
    };
    expect(isProductRegionRestricted({ ipInfo: byRegion, customRegions })).toBe(
      true,
    );
    expect(isProductRegionRestricted({ ipInfo: byCity, customRegions })).toBe(
      true,
    );
    expect(
      isProductRegionRestricted({ ipInfo: unrestricted, customRegions }),
    ).toBe(false);
  });

  test("custom regions work without a platform list", () => {
    expect(
      isProductRegionRestricted({
        ipInfo: { region: "Canada", city: "Toronto" },
        customRegions: ["toronto"],
      }),
    ).toBe(true);
    expect(
      isProductRegionRestricted({
        ipInfo: { region: "Canada", city: "Toronto" },
        customRegions: [],
      }),
    ).toBe(false);
  });

  test("custom regions union with the platform list without loosening it", () => {
    const platformAreas: API.ProductRestrictedAreasResponse = {
      ...areas,
      countries: { rows: [{ name: "Singapore", visibility: "visible" }] },
    };
    expect(
      isProductRegionRestricted({
        platformAreas,
        ipInfo: { region: "Singapore" },
        customRegions: [],
      }),
    ).toBe(true);
    expect(
      isProductRegionRestricted({
        platformAreas,
        ipInfo: { region: "Canada", city: "Toronto" },
        customRegions: ["toronto"],
      }),
    ).toBe(true);
    expect(
      isProductRegionRestricted({
        platformAreas,
        ipInfo: { region: "Canada", city: "Montreal" },
        customRegions: ["toronto"],
      }),
    ).toBe(false);
  });
});

describe("useProductRegionRestricted", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
  });

  const platformAreas: API.ProductRestrictedAreasResponse = {
    ...areas,
    countries: { rows: [{ name: "Singapore", visibility: "visible" }] },
  };

  const mockQueries = (data: {
    platformAreas?: API.ProductRestrictedAreasResponse;
    ipInfo?: ProductRegionIpInfo;
  }) => {
    useQueryMock.mockImplementation((url: string | null) => {
      if (url === "/v1/product_restricted_areas?product_type=BINARY") {
        return { data: data.platformAreas };
      }
      if (url === "/v1/ip_info") return { data: data.ipInfo };
      return { data: undefined };
    });
  };

  test("unions the platform list with custom regions", () => {
    mockQueries({
      platformAreas,
      ipInfo: { region: "Canada", city: "Toronto" },
    });
    const { result, rerender } = renderHook(() =>
      useProductRegionRestricted({
        platformAreasUrl: "/v1/product_restricted_areas?product_type=BINARY",
        customRegions: ["toronto"],
      }),
    );
    expect(result.current).toBe(true);

    mockQueries({
      platformAreas,
      ipInfo: { region: "Canada", city: "Ottawa" },
    });
    rerender();
    expect(result.current).toBe(false);
  });

  test("omitting platformAreasUrl fires no platform request", () => {
    mockQueries({ ipInfo: { region: "Canada", city: "Toronto" } });
    const { result } = renderHook(() =>
      useProductRegionRestricted({ customRegions: ["toronto"] }),
    );
    const urls = useQueryMock.mock.calls.map(([url]) => url);
    expect(urls).toEqual([null, "/v1/ip_info"]);
    expect(result.current).toBe(true);
  });

  test("disabled gates skip both queries and fail open", () => {
    mockQueries({});
    const { result } = renderHook(() =>
      useProductRegionRestricted({
        platformAreasUrl: "/v1/product_restricted_areas?product_type=BINARY",
        customRegions: ["toronto"],
        enabled: false,
      }),
    );
    const urls = useQueryMock.mock.calls.map(([url]) => url);
    expect(urls).toEqual([null, null]);
    expect(result.current).toBe(false);
  });
});
