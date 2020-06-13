import React from "react"
import PropTypes from "prop-types"

import { Ace } from "../react-ace"

export interface CodeProps {
  className?: string
}
export const Code: React.FC<CodeProps> = ({ className, ...props }) => {
  const mode = className?.replace(/language-/, "") || ""
  return <Ace mode={mode} {...props} />
}
Code.propTypes = {
  className: PropTypes.string,
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
