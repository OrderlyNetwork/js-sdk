import { BaseOrderlyKeyPair } from "../src";
import * as ed from "@noble/ed25519";

describe("keyPair", () => {
  beforeEach(() => {
    const crypto = require("crypto");
    global.crypto = crypto;
  });
  it("get public", async () => {
    const keyPair = new BaseOrderlyKeyPair(
      "AFmQSju4FhDwG93cMdKogcnKx7SWmViDtDv5PVzfvRDF"
    );

    const publicKey = await keyPair.getPublicKey();

    // console.log("publicKey", publicKey);

    expect(publicKey).toBe(
      "ed25519:FwPH3gH4G6NqFyYr1YD5njRC6FGNRPRXnZ5SLAxHie5J"
    );
  });

  it("ramdom key", async () => {
    const keyPair = BaseOrderlyKeyPair.generateKey();
    console.log("generated keyPair:", keyPair);
  });
});
