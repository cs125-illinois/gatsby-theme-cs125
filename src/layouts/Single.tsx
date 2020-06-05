import React, { ReactNode } from "react"
import PropTypes from "prop-types"

import { ThemeProvider } from "../material-ui"
import CssBaseline from "@material-ui/core/CssBaseline"
import { ElementTracker, UpdateHash } from "@cs125/element-tracker"
import { SavePosition } from "../gatsby/SavePosition"
import { Helmet } from "react-helmet"
import { TopBar } from "../material-ui/"
import { MDXProvider } from "@mdx-js/react"
import { StickyBar } from "../material-ui"
import { SidebarMenu } from "../element-tracker"
import { MainContainer } from "../material-ui"
import { components } from "../mdx"
import { FixedObject } from "gatsby-image"

export interface SingleProps {
  title: string
  description: string
  logo: FixedObject
  children: ReactNode
}
export const Single: React.FC<SingleProps> = ({ title, description, logo, children }) => (
  <ThemeProvider>
    <CssBaseline />
    <ElementTracker>
      <SavePosition />
      <Helmet>
        <meta charSet="utf-8" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <script async defer src="https://apis.google.com/js/platform.js" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link rel="preconnect" href="https://accounts.google.com" crossOrigin="use-credentials" />
        <link rel="preconnect" href="https://apis.google.com" />
        <link rel="preconnect" href="https://ssl.gstatic.com" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
      </Helmet>
      <UpdateHash filter={element => element.tagName.toLowerCase() === "h2"} />
      <TopBar title={<code>{title}</code>} logo={logo} />
      <StickyBar minWidth={128} side={"right"} center={"md"}>
        <SidebarMenu />
      </StickyBar>
      <MainContainer>
        <MDXProvider components={components}>{children}</MDXProvider>
      </MainContainer>
    </ElementTracker>
  </ThemeProvider>
)

Single.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  logo: PropTypes.any.isRequired,
  children: PropTypes.node.isRequired,
}
