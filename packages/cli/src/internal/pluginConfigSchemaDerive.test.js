const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { deriveConfigSchema } = require("./pluginConfigSchema");

const fixtureDir = path.join(__dirname, "fixtures", "sample-plugin");

describe("deriveConfigSchema", () => {
  it("derives fields, constraints and required from the register signature", () => {
    const { schema, warnings, registerExport } = deriveConfigSchema(fixtureDir);
    assert.equal(registerExport, "registerSamplePlugin");
    assert.deepEqual(schema, {
      type: "object",
      properties: {
        jwtToken: {
          type: "string",
          description: "JWT token for fee-free swaps.",
        },
        slippageTolerance: {
          type: "number",
          description: "Default slippage tolerance in basis points.",
          minimum: 1,
          maximum: 5000,
          default: 100,
        },
        className: { type: "string", description: "Optional CSS class." },
        mode: {
          type: "string",
          description: "Required mode.",
          enum: ["a", "b"],
        },
        flag: { type: "boolean", description: "Required flag." },
      },
      required: ["mode", "flag"],
      additionalProperties: false,
    });
    assert.equal(warnings.length, 2);
    assert.match(warnings.join(";"), /nested/);
    assert.match(warnings.join(";"), /onEvent/);
  });

  it("reports missing sources without throwing", () => {
    const result = deriveConfigSchema(
      path.join(__dirname, "definitely-missing"),
    );
    assert.equal(result.schema, null);
    assert.equal(result.registerExport, null);
    assert.ok(result.warnings.length > 0);
  });
});
