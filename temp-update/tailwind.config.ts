import type { Config } from 'tailwindcss';

// Define the configuration
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Your theme extensions
    },
  },
  plugins: [],
};

// Export the configuration
export default config;
