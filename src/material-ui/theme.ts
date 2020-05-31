import { createMuiTheme, responsiveFontSizes } from "@material-ui/core/styles"

import "./global.scss"

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
    palette: {
      text: {
        primary: "rgba(0, 0, 0, 0.8)",
      },
    },
  })
)
