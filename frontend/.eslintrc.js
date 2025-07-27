module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    "jsx-a11y/label-has-associated-control": "off",
    "jsx-a11y/no-static-element-interactions": "off",
    "react-hooks/rules-of-hooks": "warn",
    "react/no-unescaped-entities": "off",
    "no-console": "warn",
    "import/order": "warn",
    "react/jsx-sort-props": "off",
    "@next/next/no-img-element": "off",
    "padding-line-between-statements": "off",
    "prettier/prettier": "off",
  },
  ignorePatterns: ["node_modules/", ".next/"],
};
