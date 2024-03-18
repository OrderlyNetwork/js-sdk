import { usePrivateQuery } from "@orderly.network/hooks"

export const useReferee  = () => {

    const { data, error, mutate } = usePrivateQuery("/v1/referral/referee_history");


    return {data, error, mutate};
}