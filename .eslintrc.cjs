module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 15,
    sourceType: "module",
  },
  rules: {
    "no-unused-vars": "off",
  },
  ignorePatterns: ["dist/", "node_modules/"],
};
