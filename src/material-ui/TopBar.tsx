import React, { ReactNode } from "react"
import PropTypes from "prop-types"

import { AppBar, Container, makeStyles, Theme, Typography } from "@material-ui/core"
import { LoginButton } from "../react-google-login"
import { graphql } from "gatsby"
import { useStaticQuery } from "gatsby"

import { LogoQuery } from "types/graphql"
import Image, { FixedObject } from "gatsby-image"

export const topBarHeight = (theme: Theme): number => theme.spacing(8)

const useStyles = makeStyles(theme => ({
  top: {
    position: "fixed",
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
  },
  container: {
    height: topBarHeight(theme),
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
  title: ReactNode
}
export const TopBar: React.FC<TopBarProps> = ({ title }) => {
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
        <Typography variant={"h3"} component={"div"} noWrap style={{ flex: 1 }}>
          <code>{title}</code>
        </Typography>
        <div style={{ flexShrink: 0 }}>
          <LoginButton style={{ flexShrink: 0 }} />
        </div>
      </Container>
    </AppBar>
  )
}
TopBar.propTypes = {
  title: PropTypes.node.isRequired,
}
