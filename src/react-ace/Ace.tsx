import React, { useRef, ReactNode } from "react"
import PropTypes from "prop-types"

import { makeStyles, useTheme } from "@material-ui/core"
import Children from "react-children-utilities"

import AceEditor, { IAceEditorProps, ICommand } from "react-ace"

import "ace-builds/src-noconflict/mode-sh"
import "ace-builds/src-noconflict/mode-java"
import "ace-builds/src-noconflict/mode-kotlin"
import "ace-builds/src-noconflict/theme-chrome"
import "ace-builds/src-noconflict/theme-tomorrow_night"

const useStyles = makeStyles(theme => ({
  "@global": {
    ".ace_gutter": {
      background: "none !important",
    },
    ".ace_gutter-cell": {
      width: "100%",
      paddingLeft: "0!important",
      paddingRight: `${theme.spacing(1)}px !important`,
    },
    ".ace_display_only .ace_cursor-layer": {
      display: "none",
    },
    ".ace_mobile-menu": {
      display: "none !important",
    },
  },
  wrapper: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.action.hover,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    position: "relative",
  },
  editor: {
    fontFamily: "Source Code Pro, monospace",
    backgroundColor: `rgba(0,0,0,0)!important`,
    background: "none!important",
  },
}))

const DISABLED_COMMANDS = [
  {
    name: "gotoline",
    exec: (): boolean => {
      return false
    },
  },
] as ICommand[]

export interface AceProps extends IAceEditorProps {
  clickOut?: boolean
  displayOnly?: boolean
  initialCursorPosition?: number[]
  children?: ReactNode
}
export const Ace: React.FC<AceProps> = ({
  clickOut = true,
  displayOnly,
  initialCursorPosition,
  children,
  ...props
}) => {
  const display = useRef(typeof window !== "undefined")

  const classes = useStyles()
  const muiTheme = useTheme()
  const gutterWidth = muiTheme.spacing(3)

  const commands = (props.commands || []).concat(DISABLED_COMMANDS)
  const setOptions = Object.assign({}, props.setOptions)
  const value = props.value !== undefined ? props.value : children ? Children.onlyText(children).trim() : props.value

  displayOnly = displayOnly !== undefined ? displayOnly : !(props.mode === "java" || props.mode === "kotlin")

  const showPrintMargin = displayOnly ? false : props.showPrintMargin
  if (displayOnly) {
    setOptions.readOnly = true
    setOptions.highlightActiveLine = false
    setOptions.highlightGutterLine = false
    setOptions.fixedWidthGutter = true
  }

  const theme = props.theme || muiTheme.palette.type === "light" ? "chrome" : "tomorrow_night"

  return (
    <div
      className={`${classes.wrapper} ${displayOnly && "ace_display_only"}`.trim()}
      style={{ display: display.current ? "block" : "none" }}
    >
      {!displayOnly && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: gutterWidth + muiTheme.spacing(1) + 2,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.05)",
          }}
        />
      )}
      <AceEditor
        {...props}
        onBeforeLoad={ace => {
          ace.config.set("basePath", "https://cdn.jsdelivr.net/npm/ace-builds@1.4.11/src-min-noconflict")
          props.onBeforeLoad && props.onBeforeLoad(ace)
        }}
        onLoad={editor => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const session = editor.session as any
          session.gutterRenderer = {
            getWidth: function () {
              return gutterWidth
            },
            getText: function (session: { $firstLineNumber: number }, row: number) {
              return displayOnly ? "" : session.$firstLineNumber + row
            },
          }
          if (!displayOnly && initialCursorPosition) {
            editor.moveCursorTo(initialCursorPosition[0], initialCursorPosition[1])
          }
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onBlur={(event, editor: any) => {
          if (clickOut) {
            if (document.activeElement != editor?.textInput.getElement()) {
              editor?.clearSelection()
            }
          }
          props.onBlur && props.onBlur(event, editor)
        }}
        commands={commands}
        value={value}
        showPrintMargin={showPrintMargin}
        setOptions={setOptions}
        className={classes.editor}
        theme={theme}
      />
    </div>
  )
}
Ace.propTypes = {
  clickOut: PropTypes.bool,
  initialCursorPosition: PropTypes.arrayOf(PropTypes.number.isRequired),
  children: PropTypes.node,
  ...AceEditor.propTypes,
}
Ace.defaultProps = {
  clickOut: true,
  width: "100%",
  showPrintMargin: false,
  mode: "text",
  fontSize: "1rem",
  maxLines: 32,
  setOptions: {
    tabSize: 2,
    useSoftTabs: true,
  },
}
