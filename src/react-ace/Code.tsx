import React from "react"

import AceEditor, { IAceEditorProps, ICommand, IAceOptions } from "react-ace"
import { makeStyles } from "@material-ui/core"

if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ace = require("ace-builds/src-noconflict/ace")
  ace.config.set("basePath", "https://cdn.jsdelivr.net/npm/ace-builds@1.4.11/src-min-noconflict")
}

const useStyles = makeStyles(theme => ({
  wrapper: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.action.hover,
    padding: theme.spacing(2),
  },
  editor: {
    fontFamily: "Source Code Pro, monospace",
    backgroundColor: `rgba(0,0,0,0)!important`,
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

export interface CodeProps extends IAceEditorProps {
  fontFamily?: string
  displayOnly?: boolean
}
export const Code: React.FC<CodeProps> = props => {
  const classes = useStyles()

  const commands = (props.commands || []).concat(DISABLED_COMMANDS)
  const showGutter =
    props.showGutter !== undefined ? props.showGutter : props.mode === "java" || props.mode === "kotlin"
  const setOptions = props.setOptions || ({} as IAceOptions)

  const displayOnly =
    props.displayOnly !== undefined ? props.displayOnly : !(props.mode === "java" || props.mode === "kotlin")
  const showPrintMargin = displayOnly ? false : props.showPrintMargin
  if (displayOnly) {
    setOptions.readOnly = true
    setOptions.highlightActiveLine = false
    setOptions.highlightGutterLine = false
  }
  return (
    <div className={classes.wrapper}>
      <AceEditor
        {...props}
        onLoad={editor => {
          if (displayOnly) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const renderer = editor.renderer as any
            renderer.$cursorLayer.element.style.display = "none"
          }
          props.onLoad && props.onLoad(editor)
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onBlur={(event, editor: any) => {
          if (displayOnly) {
            if (document.activeElement != editor?.textInput.getElement()) {
              editor?.clearSelection()
            }
          }
          props.onBlur && props.onBlur(event, editor)
        }}
        commands={commands}
        showGutter={showGutter}
        showPrintMargin={showPrintMargin}
        setOptions={setOptions}
        className={classes.editor}
      />
    </div>
  )
}
Code.propTypes = {
  ...AceEditor.propTypes,
}
Code.defaultProps = {
  theme: "chrome",
  fontFamily: "Source Code Pro, monospace",
  width: "100%",
  showPrintMargin: false,
  mode: "text",
  fontSize: "1rem",
  maxLines: 32,
}
