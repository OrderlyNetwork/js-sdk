import { defineConfig } from "eslint/config";
import customEslintConfig from "@orderly.network/eslint-config";

// export default defineConfig(customEslintConfig);

export default defineConfig([
  ...customEslintConfig,
  {
    settings: {
      tailwindcss: {
        config: "./packages/ui/tailwind.config.js",
      },
    },
  },
  {
    rules: {
      // i18n keys must be string literals: static key extraction only sees
      // literal keys, so `t(`common.${side}`)` silently loses translations
      // while tests (identity-mocked i18n) still pass. For union-keyed labels
      // use the Record<union, string> label-map pattern from
      // packages/prediction/src/prediction/predictionLabels.ts.
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.name='t'] > TemplateLiteral[expressions.length>0], CallExpression[callee.property.name='t'] > TemplateLiteral[expressions.length>0]",
          message:
            "i18n keys must be string literals; interpolated keys are invisible to static extraction. Use a Record<union, string> label map (see packages/prediction/src/prediction/predictionLabels.ts).",
        },
      ],
    },
  },
]);
