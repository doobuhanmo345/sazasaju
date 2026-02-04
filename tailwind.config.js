/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './contexts/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './utils/**/*.{js,ts,jsx,tsx,mdx}',
    './ui/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    { pattern: /bg-(red|blue|indigo|amber|emerald|rose|purple|teal|violet|pink)-[0-9]+/ },
    { pattern: /from-(red|blue|indigo|amber|emerald|rose|purple|teal|violet|pink)-[0-9]+/ },
    { pattern: /to-(red|blue|indigo|amber|emerald|rose|purple|teal|violet|pink)-[0-9]+/ },
    { pattern: /shadow-(red|blue|indigo|amber|emerald|rose|purple|teal|violet|pink)-[0-9]+/ },
    { pattern: /hover:from-[a-z]+-[0-9]+/ },
    { pattern: /hover:to-[a-z]+-[0-9]+/ },
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'max-xs': { max: '449px' },
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        shine: {
          '100%': { left: '125%' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        marquee: 'marquee 60s linear infinite',
        'marquee-reverse': 'marquee-reverse 60s linear infinite',
        shine: 'shine 1s',
      },
    },
  },
  plugins: [],
};
