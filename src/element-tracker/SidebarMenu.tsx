import React, { useState, useLayoutEffect } from "react"

import { useElementTracker, active } from "@cs125/element-tracker"
import { List, ListItem, Typography } from "@material-ui/core"

export const SidebarMenu: React.FC = () => {
  const { components } = useElementTracker()
  const [activeHeader, setActiveHeader] = useState<string | undefined>(undefined)

  useLayoutEffect(() => {
    if (!components || components.length === 0) {
      setActiveHeader(undefined)
      return
    }
    const activeHeader = active(components.filter(c => c.tag === "h2"))
    setActiveHeader(activeHeader && activeHeader.id)
  }, [components])

  if (!components) {
    return null
  }
  return (
    <List dense>
      {components
        .filter(c => c.tag === "h2")
        .map((component, i) => {
          const headerLocation = `${window.location.href.split("#")[0]}#${component.id}`
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
                  fontWeight: activeHeader && component.id && component.id === activeHeader ? 900 : "normal",
                }}
              >
                <span onClick={(): void => setActiveHeader(component.id)}>{component.text}</span>
              </Typography>
            </ListItem>
          )
        })}
    </List>
  )
}
