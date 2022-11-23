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
    extend: {
      typography: ({theme}) => ({
        DEFAULT: {
          css: {
            '--tw-prose-headings': theme('colors.navy.dark'),
            '--tw-prose-body': theme('colors.navy.DEFAULT'),
            '--tw-prose-links': theme('colors.blue.DEFAULT'),
            '--tw-prose-bullets': theme('colors.navy.DEFAULT'),
            h1: { fontWeight: '500'},
            h2: { fontWeight: '400'},
            h3: { fontWeight: '400'},
            h4: { fontWeight: '400'},
            p: { fontWeight: '400'},
            a: { fontWeight: '400'},
          }
        }
      })
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
