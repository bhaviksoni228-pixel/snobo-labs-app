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
          2: '#1a1a1a',
          3: '#3a3a3a',
          4: '#7a7a7a',
          5: '#c9c9c9',
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
