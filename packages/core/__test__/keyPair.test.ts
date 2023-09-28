import { BaseOrderlyKeyPair } from "../src";
import * as ed from "@noble/ed25519";

beforeAll(() => {
  const crypto = require("crypto");
  global.crypto = crypto;
});

describe("keyPair", () => {
  test("get public", async () => {
    const keyPair = new BaseOrderlyKeyPair(
      "AFmQSju4FhDwG93cMdKogcnKx7SWmViDtDv5PVzfvRDF"
    );

    const publicKey = await keyPair.getPublicKey();

    // console.log("publicKey", publicKey);

    expect(publicKey).toBe(
      "ed25519:FwPH3gH4G6NqFyYr1YD5njRC6FGNRPRXnZ5SLAxHie5J"
    );
  });

  // it("ramdom key", async () => {
  //   const keyPair = BaseOrderlyKeyPair.generateKey();
  //   console.log("generated keyPair:", keyPair);
  // });

  // describe("generate orderly key, secretKey len eq 44", () => {

  // const keys = new Array(100).map(() => [
  //   BaseOrderlyKeyPair.generateKey().secretKey,
  //   44,
  // ]);

  // console.log(keys);

  // test.each(keys)("secretKey len eq 44", (key, expected) => {
  //   console.log(key, expected);
  //   expect(key.length).toBe(expected);
  // });

  test("secretKey len eq 44", () => {
    let index = 100;
    while (index > 0) {
      index--;
      const keyPair = BaseOrderlyKeyPair.generateKey();

      expect(keyPair.secretKey.length).toBe(44);
    }
  });

  //   // expect(keyPair).toBeTruthy();
  // });
});
