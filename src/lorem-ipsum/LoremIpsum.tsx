import React, { useMemo } from "react"
import PropTypes from "prop-types"

import { randomParagraphs } from "./randomParagraphs"

export const LoremIpsum: React.FC<{ p: number }> = ({ p }) => {
  const paragraphs = useMemo(() => {
    return randomParagraphs(p)
  }, [p])
  return <React.Fragment>{paragraphs}</React.Fragment>
}
LoremIpsum.propTypes = {
  p: PropTypes.number.isRequired,
}
