import React, { useState, useLayoutEffect, useEffect } from "react"
import PropTypes from "prop-types"

import { useElementTracker, active } from "@cs125/element-tracker"
import { List, ListItem, Typography, makeStyles } from "@material-ui/core"

const useStyles = makeStyles(theme => ({
  list: {
    "&:hover": {
      cursor: "pointer",
    },
  },
  item: {
    paddingLeft: theme.spacing(1),
    "&:hover": {
      borderLeft: `4px solid ${theme.palette.action.disabled}`,
    },
  },
  active: {
    fontWeight: 900,
    borderLeft: `4px solid ${theme.palette.action.selected}`,
  },
  inactive: {
    fontWeight: "normal",
    borderLeft: "4px solid transparent",
  },
}))

export interface SidebarMenuProps {
  top?: number
}
export const SidebarMenu: React.FC<SidebarMenuProps> = ({ top = 0 }) => {
  const { elements, updateElements } = useElementTracker()
  const [activeHeader, setActiveHeader] = useState<string | undefined>(undefined)

  const classes = useStyles()

  useEffect(() => {
    updateElements()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    <List dense className={classes.list}>
      {elements
        .filter(e => e.tagName.toLowerCase() === "h2")
        .map((element, i) => {
          const id = element.getAttribute("data-et-id") || element.id
          const active = activeHeader && id && id === activeHeader
          return (
            <ListItem
              onClick={(): void => {
                window.location.href = `${window.location.href.split("#")[0]}#${id}`
              }}
              key={i}
            >
              <Typography variant={"h4"} className={`${classes.item} ${active ? classes.active : classes.inactive}`}>
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
