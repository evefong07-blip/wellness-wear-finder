import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const nextConfigDirectory = path.dirname(fileURLToPath(import.meta.resolve("eslint-config-next/package.json")));
const compatibility = new FlatCompat({
  baseDirectory: currentDirectory,
  resolvePluginsRelativeTo: nextConfigDirectory,
});

const config = [
  { ignores: [".next/**", ".pnpm-store/**", "node_modules/**", "next-env.d.ts"] },
  ...compatibility.extends("next/core-web-vitals", "next/typescript"),
];

export default config;
