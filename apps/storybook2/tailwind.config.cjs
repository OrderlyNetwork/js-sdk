const path = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{ts,js,tsx,jsx,mdx}",
        "../../packages/ui/src/**/*.{ts,js,tsx,jsx,mdx}",
        "../../packages/ui-connector/src/**/*.{ts,js,tsx,jsx,mdx}"
    ],
    presets: [require(path.resolve(__dirname, "../../packages/ui/tailwind.config.js"))],

};
