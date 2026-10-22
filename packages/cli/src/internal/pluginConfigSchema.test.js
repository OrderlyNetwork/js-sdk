const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { validateConfigSchema } = require("./pluginConfigSchema");

const valid = {
  type: "object",
  properties: {
    jwtToken: {
      type: "string",
      title: "1Click JWT",
      description: "Partner token for fee-free swaps.",
    },
    slippageTolerance: {
      type: "integer",
      title: "Slippage tolerance (bps)",
      default: 100,
      minimum: 1,
      maximum: 5000,
    },
    color: { type: "string", enum: ["red", "blue"] },
    flag: { type: "boolean" },
  },
  required: [],
  additionalProperties: false,
};

describe("validateConfigSchema", () => {
  it("accepts a well-formed schema", () => {
    assert.deepEqual(validateConfigSchema(valid), { valid: true, errors: [] });
  });

  it("rejects non-objects and wrong types", () => {
    assert.equal(validateConfigSchema(null).valid, false);
    assert.equal(validateConfigSchema([]).valid, false);
    assert.equal(
      validateConfigSchema({ ...valid, type: "array" }).valid,
      false,
    );
    assert.equal(
      validateConfigSchema({ ...valid, additionalProperties: true }).valid,
      false,
    );
  });

  it("rejects unknown field types and bad constraints", () => {
    const badType = validateConfigSchema({
      ...valid,
      properties: { x: { type: "object" } },
    });
    assert.equal(badType.valid, false);
    assert.match(badType.errors.join(";"), /type must be one of/);

    const badPattern = validateConfigSchema({
      ...valid,
      properties: { x: { type: "string", pattern: "([" } },
    });
    assert.match(badPattern.errors.join(";"), /regular expression/);

    const badEnum = validateConfigSchema({
      ...valid,
      properties: { x: { type: "integer", enum: ["a"] } },
    });
    assert.match(badEnum.errors.join(";"), /numbers/);
  });

  it("rejects unknown fields and dangling required entries", () => {
    const schema = {
      ...valid,
      properties: {},
      required: ["missing"],
    };
    const result = validateConfigSchema(schema);
    assert.equal(result.valid, false);
    assert.match(result.errors.join(";"), /not declared in properties/);
  });

  it("rejects oversized property sets", () => {
    const properties = {};
    for (let i = 0; i < 51; i += 1) {
      properties[`field${i}`] = { type: "string" };
    }
    const result = validateConfigSchema({ ...valid, properties });
    assert.equal(result.valid, false);
    assert.match(result.errors.join(";"), /too many properties/);
  });
});
