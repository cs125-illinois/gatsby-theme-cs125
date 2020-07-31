import React, { CSSProperties } from "react"
import PropTypes from "prop-types"

export interface CornerButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  size: number
  color: string
  style?: CSSProperties
}
export const CornerButton: React.FC<CornerButtonProps> = ({ size, color, style = {}, ...props }) => {
  return (
    <div
      {...props}
      style={{
        display: "block",
        width: size,
        height: size,
        borderStyle: "solid",
        borderWidth: `0 ${size * 2}px ${size * 2}px 0`,
        borderColor: `transparent ${color} transparent transparent`,
        position: "absolute",
        top: 0,
        right: 0,
        zIndex: 10,
        ...style,
      }}
    />
  )
}
CornerButton.propTypes = {
  size: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  children: PropTypes.any,
  style: PropTypes.any,
}
