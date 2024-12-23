// @ts-self-types="./plugin.d.ts"

export const defaultTailwindConfig: Tailwind.Config = {
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
