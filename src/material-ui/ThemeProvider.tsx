import React, { useRef, useState, useCallback, useContext } from "react"
import PropTypes from "prop-types"

import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles/"
import useMediaQuery from "@material-ui/core/useMediaQuery"

import { light, dark } from "./theme"

export interface ThemeContext {
  colorScheme: string
  setColorScheme: (scheme: string) => void
}
export const ThemeContext = React.createContext<ThemeContext>({
  colorScheme: "light",
  setColorScheme: () => {
    throw `Context provider not available`
  },
})

export const ThemeProvider: React.FC = ({ children }) => {
  const savedColorScheme = useRef(
    typeof window !== "undefined" && localStorage.getItem("ThemeProvider:savedColorScheme")
  )
  const mediaColorScheme = useMediaQuery("(prefers-color-scheme: dark)") ? "dark" : "light"
  const [colorScheme, setColorSchemeState] = useState(savedColorScheme.current || mediaColorScheme)
  const setColorScheme = useCallback((colorScheme: string) => {
    setColorSchemeState(colorScheme)
    localStorage.setItem("ThemeProvider:savedColorScheme", colorScheme)
  }, [])

  const theme = colorScheme === "dark" ? dark : light
  return (
    <ThemeContext.Provider value={{ colorScheme, setColorScheme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
export const useColorScheme = (): ThemeContext => useContext(ThemeContext)
