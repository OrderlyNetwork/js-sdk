const fs = require("fs-extra");

async function checkFileExists(filePath) {
  if (await fs.exists(filePath)) {
    throw new Error(`${filePath} already exists, please modify file path`);
  }
}

const i18nValidErrors = {
  string: "Value must be a string",
  empty: "Value cannot be empty",
  interpolation: "Invalid interpolation",
  mismatchedClosingTag: (tagName) => `Mismatched closing tag: </${tagName}>`,
  unclosedTag: (tagName) => `Unclosed tag: <${tagName}>`,
};

/**
 * Validate the value of i18n
 * @param {string} value - The value to validate
 * @returns {Object} - The validation result
 */
function validateI18nValue(value) {
  if (typeof value !== "string") {
    return { valid: false, error: i18nValidErrors.string };
  }

  // 1. check if value is empty
  if (value.trim() === "") {
    return { valid: false, error: i18nValidErrors.empty };
  }

  // 2. check if placeholder format is correct (allow `{{variable}}`)
  // allow `{{variable}}` or `{{ variable }}`
  const interpolationRegex = /{{\s*[\w.-]+\s*}}/g;
  // check if `{{` is not closed or `}}` is not opened
  const invalidInterpolationRegex =
    /{{[^{}]*$|^[^{}]*}}|[^{]{{|}}[^}]}|^{|}$|{[^{}]*}|}/;

  if (
    value.match(invalidInterpolationRegex) &&
    !value.match(interpolationRegex)
  ) {
    return { valid: false, error: i18nValidErrors.interpolation };
  }

  // 3. check if HTML tags are correctly closed
  const tagRegex = /<\/?([a-zA-Z0-9]+)(\s*\/?)>/g;
  let stack = [];
  let match;

  while ((match = tagRegex.exec(value)) !== null) {
    let [, tagName, selfClosing] = match;

    if (selfClosing === "/") {
      // self-closing tag, no need to push to stack
      continue;
    } else if (match[0].startsWith("</")) {
      // closing tag, check if stack top matches
      if (stack.length === 0 || stack.pop() !== tagName) {
        return {
          valid: false,
          error: i18nValidErrors.mismatchedClosingTag(tagName),
        };
      }
    } else {
      // opening tag, push to stack
      stack.push(tagName);
    }
  }

  if (stack.length > 0) {
    return { valid: false, error: i18nValidErrors.unclosedTag(stack.pop()) };
  }

  return { valid: true, error: null };
}

async function findJsonFiles(dir) {
  const files = await fs.readdir(dir);
  return files.filter((file) => file.endsWith(".json"));
}

module.exports = {
  checkFileExists,
  validateI18nValue,
  i18nValidErrors,
  findJsonFiles,
};
