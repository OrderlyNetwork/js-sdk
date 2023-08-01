module.exports = {
  root: true,
  // This tells ESLint to load the constants from the package `eslint-constants-custom`
  extends: ["custom"],
  settings: {
    next: {
      rootDir: ["apps/*/"],
    },
  },
};
