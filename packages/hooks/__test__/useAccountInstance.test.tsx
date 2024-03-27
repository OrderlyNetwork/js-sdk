import * as React from "react";
import { renderHook } from "@testing-library/react-hooks";
import { useAccount } from "../src/useAccount";
import {useAccountInstance} from "../src/useAccountInstance";

describe("useAccount", () => {
    test("should return the correct initial values", async () => {
        // const wrapper = ({ children }) => (
        //     <OrderlyConfigProvider brokerId={"orderly"} networkId={"testnet"}>
        //         {children}
        //     </OrderlyConfigProvider>
        // );
        const { result,waitFor  } = renderHook(
            () => {
                return useAccountInstance();
            },
            {
                // wrapper,
            }
        );

        // expect(result.current.state).toBeDefined();
        await waitFor(() => {

            expect(result.current).toBeDefined();
        },{
            timeout: 5000
        });


    });
});
