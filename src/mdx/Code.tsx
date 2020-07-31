import React from "react"
import PropTypes from "prop-types"

import { Ace } from "../react-ace"
import { Race } from "../race"

export interface CodeProps {
  className?: string
  player?: boolean
}
export const Code: React.FC<CodeProps> = ({ className, player, ...props }) => {
  const mode = className?.replace(/language-/, "") || ""
  return player ? <Race mode={mode} {...props} /> : <Ace mode={mode} {...props} />
}
Code.propTypes = {
  className: PropTypes.string,
  player: PropTypes.bool,
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
