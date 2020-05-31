import React from "react"
import PropTypes from "prop-types"

import { Helmet } from "react-helmet"
import CssBaseline from "@material-ui/core/CssBaseline"
import { ThemeProvider } from "@material-ui/core/styles"
import { theme } from "../material-ui/theme"
import { UpdateHash } from "@cs125/element-tracker"
import { TopBar } from "../material-ui/"
import { MDXProvider } from "@mdx-js/react"
import { StickyBar } from "../material-ui"
import { SidebarMenu } from "../element-tracker"
import { MainContainer } from "../material-ui"
import { components } from "../mdx"

import { String } from "runtypes"
const PACKAGE_NAME = String.check(process.env.npm_package_name)

export const Single: React.FC = ({ children }) => (
  <>
    <Helmet>
      <meta charSet="utf-8" />
      <title>{process.env.npm_package_name}</title>
      <meta name="description" content={process.env.npm_package_description} />
      <link rel="preconnect" href="https://accounts.google.com" crossOrigin="use-credentials" />
      <link rel="preconnect" href="https://ssl.gstatic.com" crossOrigin="use-credentials" />
      <link rel="preconnect" href="https://apis.google.com" crossOrigin="use-credentials" />
    </Helmet>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UpdateHash filter={element => element.tagName.toLowerCase() === "h2"} />
      <TopBar title={<code>{PACKAGE_NAME}</code>} />
      <StickyBar minWidth={128} side={"right"} center={"md"}>
        <SidebarMenu />
      </StickyBar>
      <MainContainer>
        <MDXProvider components={components}>{children}</MDXProvider>
      </MainContainer>
    </ThemeProvider>
  </>
)
Single.propTypes = {
  children: PropTypes.node.isRequired,
}
