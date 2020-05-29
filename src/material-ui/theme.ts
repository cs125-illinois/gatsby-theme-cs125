import { createMuiTheme, responsiveFontSizes } from "@material-ui/core/styles"

import "./global.scss"

const headingFontFamily = ["Overpass", "serif"].join(",")
export const theme = responsiveFontSizes(
  createMuiTheme({
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
        fontWeight: "normal",
        textDecoration: "underline",
      },
    },
    palette: {
      text: {
        primary: "rgba(0, 0, 0, 0.8)",
      },
    },
  })
)
