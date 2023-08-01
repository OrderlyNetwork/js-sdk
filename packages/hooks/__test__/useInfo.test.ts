import { renderHook } from "@testing-library/react-hooks";
import { useInfo } from "../src/apis";

test("test useInfo hook", async () => {
  const { result, waitForValueToChange } = renderHook(() => {
    return useInfo();
  });

  await waitForValueToChange(() => result.current.data, {
    timeout: 5000,
  });

  console.log(result.current.data);

  expect(result.current.data).toBeUndefined();
});
