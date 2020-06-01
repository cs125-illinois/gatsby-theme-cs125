import React, { ReactNode } from "react"
import PropTypes from "prop-types"

import { Helmet } from "react-helmet"
import { ThemeProvider } from "../material-ui/"
import CssBaseline from "@material-ui/core/CssBaseline"
import { UpdateHash } from "@cs125/element-tracker"
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
  <>
    <Helmet>
      <meta charSet="utf-8" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="preconnect" href="https://accounts.google.com" crossOrigin="use-credentials" />
      <link rel="preconnect" href="https://ssl.gstatic.com" crossOrigin="use-credentials" />
      <link rel="preconnect" href="https://apis.google.com" crossOrigin="use-credentials" />
    </Helmet>
    <ThemeProvider>
      <CssBaseline />
      <UpdateHash filter={element => element.tagName.toLowerCase() === "h2"} />
      <TopBar title={<code>{title}</code>} logo={logo} />
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
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  logo: PropTypes.any.isRequired,
  children: PropTypes.node.isRequired,
}
