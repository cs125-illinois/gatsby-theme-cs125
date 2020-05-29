import React from "react"
import PropTypes from "prop-types"

import slugify from "slugify"
import Children from "react-children-utilities"

import { headings as muiHeadings } from "../material-ui/Typography"
import { useTheme } from "@material-ui/core"

export interface HeadingProps {
  id?: string
  children: React.ReactNode
}
const Heading = (tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"): React.FC<HeadingProps> => {
  const WrappedHeading: React.FC<HeadingProps> = props => {
    const theme = useTheme()

    const { children } = props
    const text = Children.onlyText(children)
    const id = props.id || slugify(text, { lower: true })
    const Heading = muiHeadings[tag]
    return (
      <>
        <div id={id} style={{ position: "relative", top: -1 * theme.spacing(8) }} />
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
