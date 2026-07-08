import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    bg: "#0B0C10",       // Deep obsidian dark-mode baseline
                    surface: "#1F2833",  // Sleek modal/card elevation layer
                    accent: "#66FCF1",   // Clean electric cyan for interactive pops
                    muted: "#C5C6C7",    // Soft text for metadata and timestamps
                },
            },
            fontFamily: {
                sans: ["var(--font-geist-sans)", "sans-serif"],
                mono: ["var(--font-geist-mono)", "monospace"],
            },
        },
    },
    plugins: [],
};
export default config;