import type tailwindcss from "tailwindcss";

export const defaultTailwindConfig: tailwindcss.Config = {
  content: ["./**/*.{html,js,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export const defaultBaseCSS = `
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
`;
