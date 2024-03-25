import { get } from "../src";

test("get function", async () => {
  const res = (await get(
    "https://testnet-api.orderly.org/v1/public/info"
  )) as any;
  const data = await res.json();

  // expect(res).toEqual({
  //   completed: false,
  //   id: 1,
  //   title: "delectus aut autem",
  //   userId: 1,
  // });
});
