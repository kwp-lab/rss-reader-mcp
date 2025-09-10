import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  // perfectionist.configs["recommended-alphabetical"],
  eslintConfigPrettier,
  {
    ignores: ["**/*.js"],
  },
);
