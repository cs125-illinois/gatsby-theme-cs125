import { createMuiTheme, responsiveFontSizes } from "@material-ui/core/styles"

import "./global.scss"

const headingFontFamily = ["Overpass", "serif"].join(",")
const lightTheme = {
  overrides: {
    MuiCssBaseline: {
      "@global": {
        html: {
          WebkitFontSmoothing: "auto",
        },
      },
    },
  },
  typography: {
    fontFamily: ["Open Sans", "sans-serif"].join(","),
    fontSize: 18,
    h1: {
      fontFamily: headingFontFamily,
      fontSize: "3rem",
      fontWeight: 700,
    },
    h2: {
      fontFamily: headingFontFamily,
      fontSize: "2.5rem",
      fontWeight: 700,
    },
    h3: {
      fontFamily: headingFontFamily,
      fontSize: "2rem",
      fontWeight: 700,
    },
    h4: {
      fontFamily: headingFontFamily,
      fontSize: "1.25rem",
      fontWeight: 700,
    },
    h5: {
      fontFamily: headingFontFamily,
      fontSize: "1rem",
      fontWeight: 700,
    },
    h6: {
      fontFamily: headingFontFamily,
      fontSize: "1rem",
      fontWeight: 400,
      textDecoration: "underline",
    },
  },
  palette: {
    primary: {
      main: "#13294b",
    },
    secondary: {
      main: "#e84a27",
    },
    text: {
      primary: "#444444",
    },
  },
}
const darkTheme = Object.assign({}, lightTheme, {
  palette: {
    type: "dark",
    text: {
      primary: "#CCCCCC",
    },
  },
})

export const light = responsiveFontSizes(createMuiTheme(lightTheme))
export const dark = responsiveFontSizes(createMuiTheme(darkTheme))
