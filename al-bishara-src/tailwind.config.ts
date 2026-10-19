import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#faf6ee',
        surface: '#fffaf0',
        ink: '#1f1a14',
        muted: '#6b5d4f',
        accent: '#8a6d3b',
        line: '#e5ddce',
        dkb: '#12110f',
        dksurface: '#1c1a16',
        dktext: '#e8e2d6',
        dkmuted: '#a89b88',
        dkaccent: '#d4a85a',
        dkline: '#2b2823',
      },
      fontFamily: {
        body: ['var(--font-amiri)', 'Amiri', 'serif'],
        display: ['var(--font-aref)', 'Aref Ruqaa', 'serif'],
        ui: ['var(--font-cairo)', 'Cairo', 'sans-serif'],
      },
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [],
};

export default config;
