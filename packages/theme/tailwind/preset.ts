import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export const themePreset = {
  darkMode: "class",
  content: [],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Stitch UI Tokens
        "error": "#ba1a1a",
        "surface-variant": "#d3e4fe",
        "primary-fixed-dim": "#bec6e0",
        "on-primary-container": "#7c839b",
        "surface-dim": "#cbdbf5",
        "on-tertiary": "#ffffff",
        "on-surface": "#0b1c30",
        "on-primary-fixed-variant": "#3f465c",
        "on-secondary-fixed-variant": "#004395",
        "on-tertiary-fixed-variant": "#005236",
        "secondary-container": "#2170e4",
        "inverse-surface": "#213145",
        "primary-fixed": "#dae2fd",
        "on-secondary-fixed": "#001a42",
        "secondary-fixed": "#d8e2ff",
        "surface-container-low": "#eff4ff",
        "tertiary": "#000000",
        "tertiary-container": "#002113",
        "outline-variant": "#c6c6cd",
        "outline": "#76777d",
        "on-tertiary-fixed": "#002113",
        "on-surface-variant": "#45464d",
        "on-tertiary-container": "#009668",
        "surface-container": "#e5eeff",
        "surface-tint": "#565e74",
        "tertiary-fixed-dim": "#4edea3",
        "surface-bright": "#f8f9ff",
        "inverse-on-surface": "#eaf1ff",
        "tertiary-fixed": "#6ffbbe",
        "surface-container-lowest": "#ffffff",
        "on-background": "#0b1c30",
        "secondary-fixed-dim": "#adc6ff",
        "surface": "#f8f9ff",
        "inverse-primary": "#bec6e0",
        "error-container": "#ffdad6",
        "surface-container-highest": "#d3e4fe",
        "on-secondary-container": "#fefcff",
        "on-primary-fixed": "#131b2e",
        "on-error-container": "#93000a",
        "surface-container-high": "#dce9ff",
        "primary-container": "#131b2e",
        "on-secondary": "#ffffff",
        "on-error": "#ffffff",
        "on-primary": "#ffffff"
      },
      spacing: {
        "margin-desktop": "32px",
        "xl": "32px",
        "lg": "24px",
        "md": "16px",
        "xs": "4px",
        "gutter": "16px",
        "base": "4px",
        "margin-mobile": "16px",
        "sm": "8px"
      },
      fontFamily: {
        "title-md": ["Inter", "sans-serif"],
        "title-lg": ["Inter", "sans-serif"],
        "headline-md": ["Inter", "sans-serif"],
        "headline-lg": ["Inter", "sans-serif"],
        "display": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"]
      },
      fontSize: {
        "title-md": ["16px", { lineHeight: "24px", fontWeight: "600" }],
        "title-lg": ["18px", { lineHeight: "24px", fontWeight: "600" }],
        "headline-md": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "headline-lg": ["24px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "display": ["36px", { lineHeight: "44px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-sm": ["11px", { lineHeight: "14px", fontWeight: "500" }],
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" }],
        "body-sm": ["13px", { lineHeight: "18px", fontWeight: "400" }]
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "stitch-DEFAULT": "0.125rem",
        "stitch-lg": "0.25rem",
        "stitch-xl": "0.5rem",
        "stitch-full": "0.75rem"
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
