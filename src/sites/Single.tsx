import React from "react"
import PropTypes from "prop-types"

import { GatsbyThemeCs125Query } from "../../graphql-types"
import { useStaticQuery } from "gatsby"
import { graphql } from "gatsby"
import { FixedObject } from "gatsby-image"

import { Single as SingleLayout } from "../layouts"

export const Single: React.FC = ({ children }) => {
  const data: GatsbyThemeCs125Query = useStaticQuery(graphql`
    query GatsbyThemeCs125 {
      site {
        siteMetadata {
          title
          description
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
    <SingleLayout
      title={data.site?.siteMetadata?.title as string}
      description={data.site?.siteMetadata?.description as string}
      logo={data.file?.childImageSharp?.fixed as FixedObject}
    >
      {children}
    </SingleLayout>
  )
}
Single.propTypes = {
  children: PropTypes.node.isRequired,
}
