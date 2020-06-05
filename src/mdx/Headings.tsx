import React from "react"
import PropTypes from "prop-types"

import slugify from "slugify"
import Children from "react-children-utilities"

import useTheme from "@material-ui/core/styles/useTheme"
import { topBarHeight } from "../material-ui/TopBar"
import { headings as MuiHeadings } from "../material-ui/Typography"

export interface HeadingProps {
  id?: string
  children: React.ReactNode
}
const Heading = (tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"): React.FC<HeadingProps> => {
  const WrappedHeading: React.FC<HeadingProps> = ({ id, children, ...props }) => {
    const theme = useTheme()

    const text = Children.onlyText(children)
    id = id || slugify(text, { lower: true })
    const Heading = MuiHeadings[tag]
    return (
      <>
        <div id={id} style={{ position: "relative", top: -1 * topBarHeight(theme) - theme.spacing(2) }} />
        <Heading data-et={true} data-et-id={id} {...props}>
          {children}
        </Heading>
      </>
    )
  }
  WrappedHeading.propTypes = {
    id: PropTypes.string,
    children: PropTypes.node.isRequired,
  }
  return WrappedHeading
}

export const headings = {
  h1: Heading("h1"),
  h2: Heading("h2"),
  h3: Heading("h3"),
  h4: Heading("h4"),
  h5: Heading("h5"),
  h6: Heading("h6"),
}
