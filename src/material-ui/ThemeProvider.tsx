import React from "react"
import PropTypes from "prop-types"

import { ThemeProvider as MuiThemeProvider, useMediaQuery } from "@material-ui/core"

import { light, dark } from "./theme"

export const ThemeProvider: React.FC = ({ children }) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)")

  const theme = prefersDarkMode ? dark : light

  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
}
ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
