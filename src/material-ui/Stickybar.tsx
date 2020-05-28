import React, { CSSProperties, ReactNode, useMemo } from "react"
import PropTypes from "prop-types"

import { makeStyles, useTheme } from "@material-ui/core"
import { Breakpoint } from "@material-ui/core/styles/createBreakpoints"
import { MinWidth } from "./MinWidth"

const useStyles = makeStyles(() => ({
  root: {
    position: "fixed",
  },
}))

type Side = "right" | "left"
export interface StickybarProps {
  side: Side
  top?: number
  center: Breakpoint
  minWidth: number
  style?: CSSProperties
  children: ReactNode
}
export const Stickybar: React.FC<StickybarProps> = ({ side, center, minWidth, children, ...props }) => {
  const theme = useTheme()
  const classes = useStyles()

  const top = props.top !== undefined ? props.top : theme.spacing(4)

  const width = useMemo(() => `calc((100vw - ${theme.breakpoints.values[center]}px) / 2)`, [theme, center])
  const height = useMemo(() => `calc(100vh - ${top}px)`, [top])

  const style: CSSProperties = {
    top,
    width,
    height,
    ...props.style,
  }
  side === "right" ? (style.right = 0) : (style.left = 0)
  return (
    <MinWidth width={minWidth} className={classes.root} style={style}>
      {children}
    </MinWidth>
  )
}
Stickybar.propTypes = {
  side: PropTypes.oneOf<Side>(["right", "left"]).isRequired,
  top: PropTypes.number,
  center: PropTypes.oneOf<Breakpoint>(["xs", "sm", "md", "lg", "xl"]).isRequired,
  minWidth: PropTypes.number.isRequired,
  style: PropTypes.any,
  children: PropTypes.node.isRequired,
}
