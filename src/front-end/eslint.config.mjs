import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/exhaustive-deps": "warn",
      "@next/next/no-img-element": "warn",
    },
  },

  // Ignorar reglas específicas para tipos globales
  {
    files: ["src/types/global.d.ts"],
    rules: {
      "no-var": "off",
    },
  },

  {
    ignores: [".next/**", "node_modules/**", "dist/**", "out/**"],
  },
];

export default eslintConfig;
