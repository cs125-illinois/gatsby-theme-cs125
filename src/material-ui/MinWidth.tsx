import React, { useEffect, useState, useRef, HTMLProps } from "react"
import PropTypes from "prop-types"

import { throttle } from "throttle-debounce"

export interface MinWidthProps extends HTMLProps<HTMLDivElement> {
  width: number
}
export const MinWidth: React.FC<MinWidthProps> = ({ width, style, children, ...props }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const updateSize = throttle(250, () => {
      setShow(ref.current !== null && ref.current.clientWidth > width)
    })
    updateSize()
    window.addEventListener("resize", updateSize)
    return (): void => {
      window.removeEventListener("resize", updateSize)
    }
  }, [width])

  return (
    <div ref={ref} style={{ visibility: show ? "visible" : "hidden", ...style }} {...props}>
      {children}
    </div>
  )
}
MinWidth.propTypes = {
  width: PropTypes.number.isRequired,
  style: PropTypes.any,
  children: PropTypes.node.isRequired,
}
