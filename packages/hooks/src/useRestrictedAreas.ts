import { useEffect, useState } from "react";
import { useConfig } from "./";

export type RestrictedAreasReturns = {
  ip?: string;
  invalidRegions?: string[];
  restrictedAreasOpen?: boolean;
  contact?: {
    url?: string;
    text?: string;
  };
};

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface RestrictedAreasData {
  invalid_web_country: string;
  invalid_web_city: string;
}

interface IpInfoData {
  ip: string;
  city: string;
  region: string;
  checked: boolean;
}

export interface IRestrictedAreasParams {
  enableDefault?: boolean;
  customRestrictedIps?: string[];
  customRestrictedRegions?: string[];
  contact?: { url?: string; text?: string };
}

export const useRestrictedAreas = (
  params: IRestrictedAreasParams
): RestrictedAreasReturns => {
  const {
    enableDefault = false,
    customRestrictedIps = [],
    customRestrictedRegions = [],
    contact = {},
  } = params;
  const apiBaseUrl: string = useConfig("apiBaseUrl") as string;
  const [invalidWebCity, setInvalidWebCity] = useState<string[]>([]);
  const [invalidWebCountry, setInvalidWebCountry] = useState<string[]>([]);
  const [invalidRegions, setInvalidRegions] = useState<string[]>([]);
  const [city, setCity] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const [ip, setIp] = useState<string>("");
  const [restrictedAreasOpen, setRestrictedAreasOpen] =
    useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const areaRes = await fetch(`${apiBaseUrl}/v1/restricted_areas`);
        const areaResdata: ApiResponse<RestrictedAreasData> =
          await areaRes.json();

        const ipRes = await fetch(`${apiBaseUrl}/v1/ip_info`);
        const ipData: ApiResponse<IpInfoData> = await ipRes.json();
        if (areaResdata.success && ipData.success) {
          // invalid regions
          const invalidCountries = areaResdata?.data?.invalid_web_country?.replace(/\s+/g, "")
            .split(",");
          const invalidCities = areaResdata?.data?.invalid_web_city?.replace(/\s+/g, "")
            .split(",");
          const combinedInvalidRegions = (
            enableDefault ? invalidCities.concat(invalidCountries) : []
          ).concat(customRestrictedRegions?.map(item=>item?.replace(/\s+/g, "")?.toLocaleLowerCase()));

          setInvalidWebCity(invalidCities);
          setInvalidWebCountry(invalidCountries);
          setInvalidRegions(combinedInvalidRegions);

          // user's current location
          const { city, region, ip } = ipData.data;
          setCity(city);
          setRegion(region);
          setIp(ip);
          if (
            combinedInvalidRegions.includes(
              ipData?.data?.city?.replace(/\s+/g, "").toLocaleLowerCase()
            ) ||
            combinedInvalidRegions.includes(
              ipData?.data?.region?.replace(/\s+/g, "").toLocaleLowerCase()
            ) ||
            customRestrictedIps.includes(ipData?.data?.ip)
          ) {
            setRestrictedAreasOpen(true);
          }
        }
      } catch (error) {
        console.error("API regions Error", error);
      }
    };

    fetchData();
  }, [apiBaseUrl]);

  return {
    ip,
    invalidRegions,
    restrictedAreasOpen,
    contact,
  };
};
