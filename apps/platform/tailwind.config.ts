import type { Config } from "tailwindcss";
import { themePreset } from "theme/tailwind/preset";

const config = {
  presets: [themePreset],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
    "../../packages/ui/src/**/*.{ts,tsx,js,jsx}",
  ],
} satisfies Config;

export default config;
