import React from "react"
import PropTypes from "prop-types"

import { ThemeProvider } from "@material-ui/core/styles"
import { theme } from "../material-ui/theme"

import { Helmet } from "react-helmet"
import CssBaseline from "@material-ui/core/CssBaseline"
import { MDXProvider } from "@mdx-js/react"
import { components } from "../mdx"
import { Stickybar } from "../material-ui/StickyBar"
import { MainContainer } from "../material-ui/MainContainer"
import { SidebarMenu } from "../element-tracker"
import { UpdateHash } from "@cs125/element-tracker"

const Index: React.FC = ({ children }) => (
  <>
    <Helmet>
      <meta charSet="utf-8" />
      <title>{process.env.npm_package_name}</title>
      <meta name="description" content={process.env.npm_package_description} />
      <link rel="preconnect" href="https://accounts.google.com" crossOrigin="use-credentials" />
      <link rel="preconnect" href="https://ssl.gstatic.com" crossOrigin="use-credentials" />
      <link rel="preconnect" href="https://apis.google.com" crossOrigin="use-credentials" />
    </Helmet>
    <CssBaseline />
    <ThemeProvider theme={theme}>
      <UpdateHash />
      <Stickybar minWidth={128} side={"right"} center={"md"}>
        <SidebarMenu />
      </Stickybar>
      <MainContainer>
        <MDXProvider components={components}>{children}</MDXProvider>
      </MainContainer>
    </ThemeProvider>
  </>
)
Index.propTypes = {
  children: PropTypes.node.isRequired,
}
export default Index
