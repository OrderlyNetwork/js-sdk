import { ReactNode, useEffect, useState } from "react";
import { useConfig } from "./useConfig";

export type RestrictedInfoReturns = ReturnType<typeof useRestrictedInfo>;

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface RestrictedInfoData {
  invalid_web_country: string;
  invalid_web_city: string;
}

interface IpInfoData {
  ip: string;
  city: string;
  region: string;
  checked: boolean;
}

export interface RestrictedInfoOptions {
  enableDefault?: boolean;
  customRestrictedIps?: string[];
  customRestrictedRegions?: string[];
  content?:
    | ReactNode
    | ((data: { ip: string; brokerName: string }) => ReactNode);
}

export const useRestrictedInfo = (options?: RestrictedInfoOptions) => {
  const {
    enableDefault = false,
    customRestrictedIps = [],
    customRestrictedRegions = [],
    content,
  } = options || {};
  const apiBaseUrl: string = useConfig("apiBaseUrl") as string;
  const [invalidWebCity, setInvalidWebCity] = useState<string[]>([]);
  const [invalidWebCountry, setInvalidWebCountry] = useState<string[]>([]);
  const [invalidRegions, setInvalidRegions] = useState<string[]>([]);
  const [allInvalidAreas, setAllInvalidAreas] = useState<string[]>([]);
  const [city, setCity] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const [ip, setIp] = useState<string>("");
  const [restrictedOpen, setRestrictedOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const areaRes = await fetch(`${apiBaseUrl}/v1/restricted_areas`);
        const areaResdata: ApiResponse<RestrictedInfoData> =
          await areaRes.json();

        const ipRes = await fetch(`${apiBaseUrl}/v1/ip_info`);
        const ipData: ApiResponse<IpInfoData> = await ipRes.json();
        if (areaResdata.success && ipData.success) {
          // invalid regions
          const invalidCountries = areaResdata?.data?.invalid_web_country
            ?.toLocaleLowerCase()
            ?.replace(/\s+/g, "")
            .split(",");
          const invalidCities = areaResdata?.data?.invalid_web_city
            ?.toLocaleLowerCase()
            ?.replace(/\s+/g, "")
            .split(",");
          const combinedInvalidRegions = (
            enableDefault ? invalidCities.concat(invalidCountries) : []
          ).concat(
            customRestrictedRegions?.map((item) =>
              item?.replace(/\s+/g, "")?.toLocaleLowerCase()
            )
          );
          const allInvalidAreas = [
            enableDefault ? areaResdata?.data?.invalid_web_country : "",
            enableDefault ? areaResdata?.data?.invalid_web_city : "",
            customRestrictedRegions?.join(", "),
          ].filter((item) => !!item);

          setInvalidWebCity(invalidCities);
          setInvalidWebCountry(invalidCountries);
          setInvalidRegions(combinedInvalidRegions);
          setAllInvalidAreas(allInvalidAreas);

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
            setRestrictedOpen(true);
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
    invalidRegions: allInvalidAreas,
    restrictedOpen,
    content,
  };
};
