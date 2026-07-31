/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        white: '#ffffff',
        grey: {
  1: '#0a0a0a',
  2: '#242424',
  3: '#525252',
  4: '#9c9c9c',
  5: '#e2e2e2',
},
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'sans-serif'],
        body: ['var(--font-rajdhani)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
