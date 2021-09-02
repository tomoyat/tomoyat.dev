import Typography from "typography"

const typography = new Typography({
  baseFontSize: "18px",
  baseLineHeight: 1.7,
  scaleRatio: 1.9,
  googleFonts: [
    {
      name: 'M+PLUS+1p',
      styles: ['400'],
    },
    {
      name: 'Noto+Sans+JP',
      styles: ['300'],
    },
    {
      name: 'Lato',
      styles: ['400'],
    },
    {
      name: 'Roboto',
      styles: ['300'],
    },
  ],
  headerFontFamily: [
    "Lato",
    'M PLUS 1p',
  ],
  bodyFontFamily: [
    "Roboto",
    'Noto Sans JP',
  ],
  overrideStyles: ({ scale, rhythm }, options, styles) => ({
    p: {
      textAlign: 'justify',
      wordBreak: 'break-all',
      lineHeight: 1.6
    },
  })
})

export default typography
