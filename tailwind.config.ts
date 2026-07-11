import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                brand: {
                    teal: "#5bc5a7",
                    red: "#ff652f",
                    dark: "#1a1a1a",
                    gray: "#eeeeee",
                    light: "#f8f6f0",
                },
                pastel: {
                    purple: "#ebe5f5",
                    purpleText: "#6b46c1",
                    blue: "#e3f2fd",
                    blueText: "#1e88e5",
                    orange: "#fff3e0",
                    orangeText: "#f57c00",
                    green: "#e8f5e9",
                    greenText: "#43a047",
                    yellow: "#fff9c4",
                    yellowText: "#fbc02d",
                    pink: "#fce4ec",
                    pinkText: "#d81b60"
                }
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
            }
        },
    },
    plugins: [],
};
export default config;
