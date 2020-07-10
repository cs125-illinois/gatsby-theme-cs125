import React, { ReactNode, useState, Suspense, useRef, useCallback } from "react"
import PropTypes from "prop-types"

import makeStyles from "@material-ui/core/styles/makeStyles"
import useTheme from "@material-ui/core/styles/useTheme"
import Skeleton from "@material-ui/lab/Skeleton"

import Children from "react-children-utilities"

const AceEditor = React.lazy(() => import("react-ace"))
import { IAceEditorProps, ICommand } from "react-ace"
import { IAceEditor } from "react-ace/lib/types"

import { AceSSR } from "."
import { hasAceSSR } from "./AceSSR"
const SSR = typeof window === "undefined"

import { mace, useMace } from "@cs125/mace"
import { useJeed, JeedContext, Response, FlatSource, Task, TaskArguments, terminalOutput } from "@cs125/jeed-react"

import { debounce } from "throttle-debounce"

import CheckCircle from "@material-ui/icons/CheckCircle"
import Restore from "@material-ui/icons/Restore"
import PlayCircleFilled from "@material-ui/icons/PlayCircleFilled"
import CircularProgress from "@material-ui/core/CircularProgress"
import Close from "@material-ui/icons/Close"

import green from "@material-ui/core/colors/green"
import grey from "@material-ui/core/colors/grey"
import Tooltip from "@material-ui/core/Tooltip"
import Paper from "@material-ui/core/Paper"
import { CSSProperties } from "@material-ui/core/styles/withStyles"

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
    ".ace_display_only .ace_bracket": {
      display: "none",
    },
    ".ace_display_only .ace_indent-guide": {
      background: "none",
    },
    ".ace_mobile-menu": {
      display: "none !important",
    },
    ".ace_fold-widget": {
      display: "none !important",
    },
  },
  top: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  wrapper: {
    backgroundColor: theme.palette.action.hover,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    position: "relative",
  },
  skeleton: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  editor: {
    fontFamily: "Source Code Pro, monospace!important",
    backgroundColor: `rgba(0,0,0,0)!important`,
    background: "none!important",
    lineHeight: "1.4em!important",
  },
  overlaysWrapperTop: {
    zIndex: 10,
    position: "absolute",
    top: 2,
    right: 2,
    display: "flex",
  },
  overlaysWrapperBottom: {
    zIndex: 10,
    position: "absolute",
    bottom: 2,
    right: 2,
    display: "flex",
  },
  iconWrapper: {
    lineHeight: 1,
  },
  save: {
    color: green[400],
    fontSize: theme.spacing(2),
  },
  run: {
    color: green[700],
    fontSize: theme.spacing(4),
  },
  close: {
    fontSize: theme.spacing(2.4),
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 20,
    color: "white",
  },
  restore: {
    color: grey[500],
    fontSize: theme.spacing(2),
  },
  saving: {
    position: "absolute",
    top: 2,
    left: 0,
    color: green.A700,
  },
  running: {
    position: "absolute",
    bottom: 2,
    left: 0,
    color: green.A400,
  },
  tooltipPosition: {
    margin: 0,
  },
  output: {
    margin: 0,
    padding: theme.spacing(1),
    color: grey[50],
    backgroundColor: grey.A700,
    border: "none",
    overflow: "auto",
  },
  outputPre: {
    fontFamily: "Source Code Pro, monospace!important",
    margin: 0,
  },
  terminalSkeleton: {
    position: "absolute",
    zIndex: 10,
    color: "white",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
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
  id?: string
  numbers?: string
  clickOut?: boolean
  displayOnly?: boolean
  initialCursorPosition?: number[]
  overlays?: ReactNode[]
  noMaceServer?: boolean
  noJeed?: boolean
  maxOutputLines?: number
  children?: ReactNode
}
export const Ace: React.FC<AceProps> = ({
  id,
  clickOut = true,
  displayOnly,
  initialCursorPosition,
  overlays = [],
  noMaceServer = false,
  noJeed = false,
  maxOutputLines = 16,
  mode,
  children,
  ...props
}) => {
  const maceContext = useMace()
  const jeedContext = useJeed()

  const [showPlaceholder, setShowPlaceholder] = useState(true)

  const classes = useStyles()
  const muiTheme = useTheme()
  const gutterWidth = muiTheme.spacing(3)

  const commands = (props.commands || []).concat(DISABLED_COMMANDS)
  const setOptions = Object.assign({}, props.setOptions)
  const defaultValue =
    props.defaultValue !== undefined
      ? props.defaultValue
      : children
      ? Children.onlyText(children).trim()
      : props.defaultValue

  displayOnly = displayOnly !== undefined ? displayOnly : !(mode === "java" || mode === "kotlin")
  const showPrintMargin = displayOnly ? false : props.showPrintMargin
  if (displayOnly) {
    setOptions.readOnly = true
    setOptions.highlightActiveLine = false
    setOptions.highlightGutterLine = false
    setOptions.fixedWidthGutter = true
  }

  const numbers = props.numbers !== undefined ? props.numbers === "true" : !displayOnly
  const theme = props.theme || muiTheme.palette.type === "light" ? "chrome" : "tomorrow_night"
  const haveSSR = id && hasAceSSR(id)

  const SSRContent = (SSR || haveSSR) && id && (
    <div className={`${classes.wrapper} ${displayOnly ? "ace_display_only" : ""}`.trim()}>
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
      <AceSSR
        id={id}
        numbers={numbers}
        gutterWidth={`${gutterWidth + muiTheme.spacing(1) + 1}px`}
        mode={mode as string}
        theme={theme}
        lineHeight={"1.4rem"}
        fontSize={props.fontSize}
        defaultValue={defaultValue}
        className={classes.editor}
      />
    </div>
  )

  const [saving, setSaving] = useState(false)
  const startSavingTimer = useRef<ReturnType<typeof setTimeout> | undefined>()

  const saver = useRef<() => void | undefined>()

  const aceRef = useRef<IAceEditor | undefined>()
  const [modified, setModified] = useState(false)
  const connectMace = !displayOnly && id !== undefined

  if (connectMace) {
    overlays.push(
      <div className={classes.overlaysWrapperTop}>
        {modified && (
          <Tooltip title={"Restore"} placement="left" classes={{ tooltipPlacementLeft: classes.tooltipPosition }}>
            <div className={classes.iconWrapper} onClick={() => changeValue(aceRef.current, defaultValue)}>
              <Restore className={classes.restore} />
            </div>
          </Tooltip>
        )}
        <Tooltip
          title={saving ? "Saving" : "Saved"}
          placement="right"
          classes={{ tooltipPlacementRight: classes.tooltipPosition }}
        >
          <div className={classes.iconWrapper}>
            <CheckCircle className={classes.save} />
            {saving && <CircularProgress className={classes.saving} disableShrink size={muiTheme.spacing(2)} />}
          </div>
        </Tooltip>
      </div>
    )
  }

  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState<string>("")
  const [showOutput, setShowOutput] = useState(false)

  const run = useCallback(() => {
    const contents = aceRef.current?.getValue()
    if (!contents) {
      return
    }
    setRunning(true)
    runJeedJob({ id: "test", sources: [{ path: "", contents }], tasks: ["compile", "execute"] }, jeedContext).then(
      response => {
        const output = terminalOutput(response)
        setOutput(output !== "" ? output : "(Completed With No Output)")
        setShowOutput(true)
        setRunning(false)
      }
    )
  }, [jeedContext])

  const connectJeed = (mode === "java" || mode === "kotlin") && !noJeed
  if (connectJeed) {
    overlays.push(
      <div className={classes.overlaysWrapperBottom}>
        <Tooltip title={"Run"} placement="right" classes={{ tooltipPlacementRight: classes.tooltipPosition }}>
          <div className={classes.iconWrapper} onClick={run}>
            <PlayCircleFilled className={classes.run} onClick={run} />
            {running && <CircularProgress className={classes.running} disableShrink size={muiTheme.spacing(4)} />}
          </div>
        </Tooltip>
      </div>
    )
    commands.push({
      name: "run",
      bindKey: { win: "Ctrl-Enter", mac: "Ctrl-Enter" },
      exec: run,
    })
  }

  return (
    <div className={classes.top}>
      {showPlaceholder &&
        (SSRContent || (
          <Skeleton
            className={classes.skeleton}
            height={`calc(${(defaultValue?.split("\n").length || 0) * 1.4}rem + ${muiTheme.spacing(2)} * 2px)`}
            variant={"rect"}
            style={{ display: showPlaceholder ? "block" : "none" }}
          />
        ))}
      {!SSR && (
        <Suspense fallback={<div></div>}>
          <div
            className={`${classes.wrapper} ${displayOnly ? "ace_display_only" : ""}`.trim()}
            style={{ display: showPlaceholder ? "none" : "block" }}
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
            {overlays && overlays}
            <AceEditor
              {...props}
              mode={mode}
              onBeforeLoad={ace => {
                ace.config.set("basePath", "https://cdn.jsdelivr.net/npm/ace-builds@1.4.11/src-min-noconflict")
                props.onBeforeLoad && props.onBeforeLoad(ace)
              }}
              onChange={value => {
                defaultValue && setModified(value !== defaultValue)
              }}
              onLoad={editor => {
                aceRef.current = editor

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const session = editor.session as any
                session.gutterRenderer = {
                  getWidth: function () {
                    return gutterWidth
                  },
                  getText: function (session: { $firstLineNumber: number }, row: number) {
                    return !numbers ? "" : session.$firstLineNumber + row
                  },
                }
                if (!displayOnly && initialCursorPosition) {
                  editor.moveCursorTo(initialCursorPosition[0], initialCursorPosition[1])
                }
                if (connectMace && id) {
                  const save = mace({
                    editor,
                    context: maceContext,
                    id,
                    onUpdate: () => {
                      saver.current && saver.current()
                    },
                    onSelectionChange: () => {
                      saver.current && saver.current()
                    },
                    saveCompleted: () => {
                      startSavingTimer.current && clearTimeout(startSavingTimer.current)
                      setSaving(false)
                    },
                  })
                  saver.current = debounce(1000, () => {
                    setTimeout(() => {
                      startSavingTimer.current && clearTimeout(startSavingTimer.current)
                      startSavingTimer.current = setTimeout(() => {
                        setSaving(true)
                      }, 1000)
                    })
                    save(!noMaceServer)
                  })
                }
                editor.setHighlightActiveLine(false)
                editor.setHighlightGutterLine(false)
                props.onLoad && props.onLoad(editor)
                setShowPlaceholder(false)
              }}
              onFocus={(event, editor: IAceEditor | undefined) => {
                !displayOnly && editor?.setHighlightActiveLine(props.highlightActiveLine || true)
                !displayOnly && editor?.setHighlightGutterLine(props.highlightActiveLine || true)
                props.onFocus && props.onFocus(event, editor)
              }}
              onBlur={(event, editor: IAceEditor | undefined) => {
                if (clickOut) {
                  if (document.activeElement != editor?.textInput.getElement()) {
                    const { row, column } = editor?.selection.getCursor() as { row: number; column: number }
                    editor?.selection.setSelectionRange({ start: { row, column }, end: { row, column } })
                    editor?.clearSelection()
                  }
                }
                editor?.setHighlightActiveLine(false)
                editor?.setHighlightGutterLine(false)
                props.onBlur && props.onBlur(event, editor)
              }}
              commands={commands}
              defaultValue={defaultValue}
              showPrintMargin={showPrintMargin}
              setOptions={setOptions}
              className={classes.editor}
              theme={theme}
            />
          </div>
          {showOutput && (
            <div style={{ position: "relative" }}>
              <Paper
                variant="outlined"
                square
                className={classes.output}
                style={{ maxHeight: `${1.5 * maxOutputLines}em` }}
              >
                <CornerButton size={muiTheme.spacing(2)} color={grey.A200} onClick={() => setShowOutput(false)} />
                <Close className={classes.close} onClick={() => setShowOutput(false)} />
                {running && <Skeleton variant="rect" className={classes.terminalSkeleton} />}
                <pre className={classes.outputPre}>{output}</pre>
              </Paper>
            </div>
          )}
        </Suspense>
      )}
    </div>
  )
}
Ace.propTypes = {
  id: PropTypes.string,
  clickOut: PropTypes.bool,
  displayOnly: PropTypes.bool,
  initialCursorPosition: PropTypes.array,
  overlays: PropTypes.array,
  commands: PropTypes.arrayOf(PropTypes.any.isRequired),
  setOptions: PropTypes.any,
  defaultValue: PropTypes.string,
  mode: PropTypes.string,
  theme: PropTypes.string,
  showPrintMargin: PropTypes.bool,
  highlightActiveLine: PropTypes.bool,
  onBeforeLoad: PropTypes.func,
  onLoad: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  children: PropTypes.node,
  fontSize: PropTypes.any,
  numbers: PropTypes.string,
  noMaceServer: PropTypes.bool,
  noJeed: PropTypes.bool,
  maxOutputLines: PropTypes.number,
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
  noMaceServer: false,
  noJeed: false,
  maxOutputLines: 16,
}

const changeValue = (editor: IAceEditor | undefined, value: string | undefined) => {
  if (!editor || !value) {
    return
  }
  const position = editor.session.selection.toJSON()
  editor.setValue(value)
  editor.session.selection.fromJSON(position)
}

interface JeedJob {
  id: string
  sources: FlatSource[]
  tasks: Task[]
  args?: TaskArguments
}

const runJeedJob = (job: JeedJob, jeed: JeedContext): Promise<Response> => {
  const { id, sources, tasks, args } = job

  const snippet = sources.length === 1 && sources[0].path === ""
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const request = { label: id, tasks, args } as any
  if (snippet) {
    request.snippet = sources[0].contents
  } else {
    request.sources = sources
  }

  return jeed.run(request)
}

interface CornerButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  size: number
  color: string
  style?: CSSProperties
}
const CornerButton: React.FC<CornerButtonProps> = ({ size, color, style = {}, ...props }) => {
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
