import React, { ReactNode } from "react"

import { AppBar, Container, makeStyles } from "@material-ui/core"
import { LoginButton } from "../react-google-login"
import { useStaticQuery, graphql } from "gatsby"

import { LogoQuery } from "types/graphql"
import Image, { FixedObject } from "gatsby-image"

const useStyles = makeStyles(theme => ({
  top: {
    position: "fixed",
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
  },
  container: {
    height: theme.spacing(8),
    display: "flex",
    alignItems: "center",
  },
  image: {
    height: theme.spacing(6),
    width: theme.spacing(6),
    marginRight: theme.spacing(2),
    flexShrink: 0,
  },
}))

interface TopBarProps {
  title?: ReactNode
}
export const TopBar: React.FC<TopBarProps> = () => {
  const classes = useStyles()

  const data: LogoQuery = useStaticQuery(graphql`
    query Logo {
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
    <AppBar className={classes.top}>
      <Container maxWidth={"md"} className={classes.container}>
        <Image fadeIn={false} fixed={data.file?.childImageSharp?.fixed as FixedObject} className={classes.image} />
        <div style={{ flex: 1 }} />
        <div style={{ flexShrink: 0 }}>
          <LoginButton style={{ flexShrink: 0 }} />
        </div>
      </Container>
    </AppBar>
  )
}
