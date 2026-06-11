/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    fontFamily: {
      sans: ["InterVariable", "Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      mono: ["ui-monospace", "SFMono-Regular", "Consolas", "monospace"],
    },
    fontSize: {
      xs: ["12px", { lineHeight: "1.45" }],
      sm: ["13px", { lineHeight: "1.45" }],
      base: ["14px", { lineHeight: "1.5" }],
      md: ["16px", { lineHeight: "1.5" }],
      lg: ["20px", { lineHeight: "1.4" }],
      xl: ["24px", { lineHeight: "1.35" }],
    },
    fontWeight: {
      normal: "var(--weight-normal)",
      medium: "var(--weight-medium)",
      semibold: "var(--weight-semibold)",
    },
    borderRadius: {
      none: "0",
      sm: "6px",
      md: "8px",
      lg: "12px",
      full: "9999px",
    },
    extend: {
      colors: {
        canvas: "var(--bg-canvas)",
        raised: "var(--bg-raised)",
        overlay: "var(--bg-overlay)",
        popover: "var(--bg-popover)",
        ink: {
          DEFAULT: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          fg: "var(--accent-fg)",
          soft: "var(--accent-soft)",
        },
        priority: {
          low: "var(--priority-low)",
          medium: "var(--priority-medium)",
          high: "var(--priority-high)",
          urgent: "var(--priority-urgent)",
        },
        status: {
          backlog: "var(--status-backlog)",
          todo: "var(--status-todo)",
          in_progress: "var(--status-in_progress)",
          blocked: "var(--status-blocked)",
          done: "var(--status-done)",
        },
      },
      borderColor: {
        subtle: "var(--border-subtle)",
        strong: "var(--border-strong)",
      },
      ringColor: {
        focus: "var(--focus-ring)",
      },
      boxShadow: {
        1: "var(--shadow-1)",
        2: "var(--shadow-2)",
        3: "var(--shadow-3)",
      },
      transitionDuration: {
        fast: "140ms",
      },
    },
  },
  plugins: [],
};
