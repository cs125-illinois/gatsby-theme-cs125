import React, { useState, useLayoutEffect } from "react"
import PropTypes from "prop-types"

import { useElementTracker, active } from "@cs125/element-tracker"
import { List, ListItem, Typography } from "@material-ui/core"

export interface SidebarMenuProps {
  top?: number
}
export const SidebarMenu: React.FC<SidebarMenuProps> = ({ top = 0 }) => {
  const { elements } = useElementTracker()
  const [activeHeader, setActiveHeader] = useState<string | undefined>(undefined)

  useLayoutEffect(() => {
    if (!elements || elements.length === 0) {
      setActiveHeader(undefined)
      return
    }
    const activeHeader = active(
      elements.filter(e => e.tagName.toLowerCase() === "h2"),
      top
    )
    if (!activeHeader) {
      setActiveHeader(undefined)
      return
    }
    const id = activeHeader.getAttribute("data-et-id") || activeHeader.id
    setActiveHeader(id)
  }, [top, elements])

  if (!elements) {
    return null
  }
  return (
    <List dense>
      {elements
        .filter(e => e.tagName.toLowerCase() === "h2")
        .map((element, i) => {
          const id = element.getAttribute("data-et-id") || element.id
          const headerLocation = `${window.location.href.split("#")[0]}#${id}`
          return (
            <ListItem
              onClick={(): void => {
                window.location.href = headerLocation
              }}
              key={i}
            >
              <Typography
                variant={"h4"}
                style={{
                  fontWeight: activeHeader && id && id === activeHeader ? 900 : "normal",
                }}
              >
                <span onClick={(): void => setActiveHeader(id)}>{element.textContent}</span>
              </Typography>
            </ListItem>
          )
        })}
    </List>
  )
}
SidebarMenu.propTypes = {
  top: PropTypes.number,
}
