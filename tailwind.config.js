/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0a0a0a",
                surface: "#121212",
                border: "#27272a", // zinc-800
                primary: {
                    DEFAULT: "#22c55e", // green-500
                    hover: "#16a34a",
                },
                danger: "#ef4444", // red-500
            },
            fontFamily: {
                sans: ['var(--font-inter)'],
            },
        },
    },
    plugins: [],
};
