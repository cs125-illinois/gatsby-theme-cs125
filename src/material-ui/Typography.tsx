import React from "react"
import PropTypes from "prop-types"

import Typography from "@material-ui/core/Typography"
import makeStyles from "@material-ui/core/styles/makeStyles"
import Link, { LinkProps } from "@material-ui/core/Link"

import { Link as GatsbyLink, GatsbyLinkProps } from "gatsby"

const useStyles = makeStyles(theme => ({
  lead: {
    marginBottom: theme.spacing(3),
    fontSize: "1.5em",
  },
  link: {
    color: theme.palette.type === "light" ? theme.palette.secondary.main : theme.palette.primary.main,
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

export const WrappedGatsbyLink = React.forwardRef(
  (props: Omit<GatsbyLinkProps<unknown>, "ref">, ref: React.Ref<HTMLAnchorElement>) => (
    <GatsbyLink {...props} innerRef={ref} />
  )
)
WrappedGatsbyLink.displayName = "WrappedGatsbyLink"

export const A: React.FC<LinkProps> = ({ href, ...props }) => {
  const classes = useStyles()

  props.className = classes.link

  if (!href) {
    return <Link {...props} />
  } else if (href.startsWith("https://") || href.startsWith("http://") || href.startsWith("//")) {
    return <Link target={"_blank"} {...props} href={href} />
  } else {
    return <Link component={WrappedGatsbyLink} {...props} to={href} />
  }
}
A.propTypes = {
  href: PropTypes.string.isRequired,
  target: PropTypes.string,
  children: PropTypes.any.isRequired,
}
