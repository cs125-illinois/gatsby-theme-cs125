import React, { ReactNode } from "react"
import PropTypes from "prop-types"

import { Ace } from "../react-ace"

export interface CodeProps {
  className?: string
  children: ReactNode
}
export const Code: React.FC<CodeProps> = ({ className, children }) => {
  const mode = className?.replace(/language-/, "") || ""
  return <Ace mode={mode}>{children}</Ace>
}
Code.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
}

export interface PreProps {
  children: React.ReactElement
}

export const Pre: React.FC<PreProps> = ({ children }) => {
  if (children?.props?.originalType === "code") {
    return <>{children}</>
  } else {
    return <pre>{children}</pre>
  }
}
