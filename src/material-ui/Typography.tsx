import React from "react"
import PropTypes from "prop-types"

import { Typography, makeStyles } from "@material-ui/core"

const useStyles = makeStyles(theme => ({
  lead: {
    marginBottom: theme.spacing(3),
    fontSize: "1.5em",
  },
}))

interface HeadingProps {
  children: React.ReactNode
}
const Heading = (tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"): React.FC<HeadingProps> => {
  const WrappedHeading: React.FC<HeadingProps> = ({ children, ...props }) => {
    return (
      <Typography variant={tag} gutterBottom={true} {...props}>
        {children}
      </Typography>
    )
  }
  WrappedHeading.propTypes = {
    children: PropTypes.node.isRequired,
  }
  return WrappedHeading
}

export const H1 = Heading("h1")
export const H2 = Heading("h2")
export const H3 = Heading("h3")
export const H4 = Heading("h4")
export const H5 = Heading("h5")
export const H6 = Heading("h6")

export const headings = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
}

export const P: React.FC = ({ children, ...props }) => (
  <Typography paragraph={true} {...props}>
    {children}
  </Typography>
)
P.propTypes = {
  children: PropTypes.node.isRequired,
}

export const Lead: React.FC = ({ children }) => {
  const classes = useStyles()
  const elements = React.Children.toArray(children).map(element => {
    return React.cloneElement(element as React.ReactElement<HTMLParagraphElement>, { className: classes.lead })
  })
  return <>{elements}</>
}
Lead.propTypes = {
  children: PropTypes.any.isRequired,
}
