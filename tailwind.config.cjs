/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    colors: {
      'moon': {
        DEFAULT: '#EAF4FC'
      },
      'navy': {
        light: '#2A4073',
        DEFAULT: '#0F2350',
        dark: '#17184B'
      },
      'blue': {
        DEFAULT: '#19448E'
      },
    },
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
