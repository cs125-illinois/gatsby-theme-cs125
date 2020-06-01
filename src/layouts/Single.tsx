import React, { ReactNode } from "react"
import PropTypes from "prop-types"

import { useStaticQuery } from "gatsby"
import { graphql } from "gatsby"
import { SingleQuery } from "types/graphql"

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
import { FixedObject } from "gatsby-image"

export interface SingleProps {
  title?: string
  children: ReactNode
}
export const Single: React.FC<SingleProps> = ({ title, children }) => {
  const data: SingleQuery = useStaticQuery(graphql`
    query Single {
      site {
        siteMetadata {
          title
        }
      }
      file(relativePath: { eq: "logo.png" }, sourceInstanceName: { eq: "images" }) {
        childImageSharp {
          fixed(width: 48, height: 48) {
            base64
            width
            height
            src
            srcSet
          }
        }
      }
    }
  `)
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{data.site?.siteMetadata?.title}</title>
        <meta name="description" content={process.env.npm_package_description} />
        <link rel="preconnect" href="https://accounts.google.com" crossOrigin="use-credentials" />
        <link rel="preconnect" href="https://ssl.gstatic.com" crossOrigin="use-credentials" />
        <link rel="preconnect" href="https://apis.google.com" crossOrigin="use-credentials" />
      </Helmet>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <UpdateHash filter={element => element.tagName.toLowerCase() === "h2"} />
        <TopBar
          title={<code>{title || data.site?.siteMetadata?.title}</code>}
          logo={data.file?.childImageSharp?.fixed as FixedObject}
        />
        <StickyBar minWidth={128} side={"right"} center={"md"}>
          <SidebarMenu />
        </StickyBar>
        <MainContainer>
          <MDXProvider components={components}>{children}</MDXProvider>
        </MainContainer>
      </ThemeProvider>
    </>
  )
}
Single.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
}
