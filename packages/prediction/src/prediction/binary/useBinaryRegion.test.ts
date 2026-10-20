import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { ModuleKind, transpileModule } from "typescript";

// Isolate the adapter from package bundles and exercise its actual hook calls.
const source = transpileModule(
  readFileSync(new URL("./useBinaryRegion.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ModuleKind.CommonJS } },
).outputText;

test("Binary region policy is forwarded for all consumers", () => {
  const policies = [
    undefined,
    {},
    { enableDefault: true, customRestrictedRegions: ["Singapore"] },
    { enableDefault: false, customRestrictedRegions: ["Toronto"] },
    { enableDefault: false, customRestrictedRegions: [] },
  ];
  for (const policy of policies) {
    for (const enabled of [true, false]) {
      let received: Record<string, unknown> | undefined;
      const exports: Record<string, (enabled?: boolean) => boolean> = {};
      runInNewContext(source, {
        exports,
        require: (id: string) => {
          if (id === "@orderly.network/react-app") {
            return {
              useAppContext: () => ({
                restrictedInfo: policy
                  ? { predictionRegionRestriction: policy }
                  : undefined,
              }),
            };
          }
          if (id === "@orderly.network/hooks") {
            return {
              useProductRegionRestricted: (
                options: Record<string, unknown>,
              ) => {
                received = options;
                return true;
              },
            };
          }
          throw new Error(`Unexpected import: ${id}`);
        },
      });
      assert.equal(exports.useBinaryRegionRestricted(enabled), true);
      assert.deepEqual(
        { ...received },
        {
          platformAreasUrl: "/v1/product_restricted_areas?product_type=BINARY",
          customRegions: policy?.customRestrictedRegions,
          enableDefault: policy?.enableDefault,
          enabled,
        },
      );
      exports.useBinaryRegionRestricted();
      assert.equal(received?.enabled, true);
    }
  }
});
