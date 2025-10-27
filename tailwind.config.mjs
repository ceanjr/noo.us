/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'system-ui', 'sans-serif'],
      },
      colors: {
        // 🎨 Paleta principal da marca
        primary: {
          50: '#fff8e1',
          100: '#ffecb3',
          200: '#ffe082',
          300: '#ffd54f',
          400: '#fcc639', // sunglow
          500: '#f7b83b', // saffron
          600: '#f29e48', // jaffa
        },
        secondary: {
          50: '#fff0f3',
          100: '#ffd9e3',
          200: '#ffb3cb',
          300: '#f48fb1',
          400: '#ec6d77', // froly
          500: '#e86485', // deep-blush
          600: '#db5d98', // cranberry
        },
        accent: {
          50: '#fff4ef',
          100: '#ffdfd5',
          200: '#fec5b3',
          300: '#fda98f',
          400: '#ef8460', // burnt-sienna
          500: '#ee776c', // apricot
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          500: '#737373',
          800: '#1a1a1a',
          900: '#000000',
        },
      },
    },
  },
  plugins: [],
};