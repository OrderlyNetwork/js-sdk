import { get } from "../src";

test("get function", async () => {
  const res = await get("https://testnet-api.orderly.org/v1/public/info");
  const data = await res.json();
  console.log(data)
  // expect(res).toEqual({
  //   completed: false,
  //   id: 1,
  //   title: "delectus aut autem",
  //   userId: 1,
  // });
});
