/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        bg: '#0d0f12',
        surface: '#161a20',
        card: '#1e2430',
        card2: '#232b36',
        border: '#2a3340',
        green: {
          DEFAULT: '#00d084',
          dark: '#00a868',
          glow: 'rgba(0,208,132,0.15)',
        },
        amber: {
          DEFAULT: '#f5a623',
        },
        muted: '#6b7d8f',
      },
    },
  },
  plugins: [],
}
