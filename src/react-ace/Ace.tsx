import React, { ReactNode, useState, Suspense, useRef, useCallback, useEffect } from "react"
import PropTypes from "prop-types"

import useTimeout from "@rooks/use-timeout"

import useTheme from "@material-ui/core/styles/useTheme"
import aceStyles from "./styles"

import Children from "react-children-utilities"

const AceEditor = React.lazy(() => import("react-ace"))
import { ICommand, IAceEditorProps } from "react-ace"
import { IAceEditor } from "react-ace/lib/types"

import { AceSSR } from "."
import { hasAceSSR } from "./AceSSR"
const SSR = typeof window === "undefined"

import { useMace } from "@cs125/mace"
import { useJeed, terminalOutput } from "@cs125/jeed"
import { AceAnnotation, createJeedJob, runJeedJob, getComplexityAnnotations } from "./jeed"
import { AceRecord, record as recorder } from "@cs125/monace"

import Skeleton from "@material-ui/lab/Skeleton"
import Close from "@material-ui/icons/Close"
import Paper from "@material-ui/core/Paper"
import { CSSProperties } from "@material-ui/core/styles/withStyles"
import grey from "@material-ui/core/colors/grey"

import { RunButton } from "./RunButton"
import { RecordButton } from "./RecordButton"
import { SavingIndicator } from "./SavingIndicator"
import { RestoreButton } from "./RestoreButton"
import { CornerButton } from "./CornerButton"

import { Record as RuntypeRecord, Literal, String as RuntypeString, Static, Union } from "runtypes"

const DISABLED_COMMANDS = [
  {
    name: "gotoline",
    exec: (): boolean => {
      return false
    },
  },
] as ICommand[]

export interface AceTrace {
  audioUrl: string
  editorTrace: AceRecord[]
}

export interface AceProps extends IAceEditorProps {
  id?: string
  numbers?: string
  clickOut?: boolean
  displayOnly?: boolean
  initialCursorPosition?: number[]
  noMaceServer?: boolean
  noJeed?: boolean
  record?: boolean
  onRecordComplete?: (trace: AceTrace) => void
  snippet?: boolean
  complexity?: boolean
  noCheckstyle?: boolean
  useContainer?: boolean
  checkForSnippet?: boolean
  maxOutputLines?: number
  wrapperStyle?: CSSProperties
  replaying?: boolean
  showOutput?: boolean
  output?: string
  children?: ReactNode
}
export const Ace: React.FC<AceProps> = ({
  id,
  clickOut = true,
  displayOnly,
  initialCursorPosition,
  noMaceServer = false,
  noJeed = false,
  record = false,
  snippet = false,
  complexity = false,
  noCheckstyle = false,
  useContainer = false,
  checkForSnippet = false,
  maxOutputLines = 16,
  mode,
  annotations,
  wrapperStyle = {},
  replaying = false,
  children,
  onRecordComplete,
  ...props
}) => {
  // Styling and SSR
  const muiTheme = useTheme()
  const classes = aceStyles()
  const gutterWidth = muiTheme.spacing(3)

  const [showPlaceholder, setShowPlaceholder] = useState(true)

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

  const editor = useRef<IAceEditor | undefined>()
  const [editorContentsModified, setEditorContentsModified] = useState(false)

  // Mace integration
  const maceContext = useMace()
  const maceGetting = useRef(false)
  const maceSaving = useRef(false)
  const [maceLoading, setMaceLoading] = useState(false)
  const { start: startMaceLoading, clear: clearMaceLoading } = useTimeout(
    () => setMaceLoading(maceSaving.current || maceGetting.current),
    1024
  )
  const connectMace = !replaying && maceContext.available && !displayOnly && id !== undefined
  useEffect(() => {
    clearMaceLoading()
    if (!(id && editor.current)) {
      return
    }
    if (!noMaceServer) {
      maceGetting.current = true
      startMaceLoading()
    }
    const onGetCompleted = () => {
      maceGetting.current = false
      clearMaceLoading()
    }
    const onSaveStarted = () => {
      maceSaving.current = true
      startMaceLoading()
    }
    const onSaveCompleted = () => {
      maceSaving.current = false
      clearMaceLoading()
    }
    const { stop } = maceContext.register({
      id,
      editor: editor.current,
      options: { useServer: !noMaceServer, onSaveStarted, onSaveCompleted, onGetCompleted },
    })

    return () => {
      stop()
      clearMaceLoading()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, maceContext, noMaceServer])

  // Race integration
  const canRecord = useRef(
    typeof navigator !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.getUserMedia
  )

  const [recording, setRecording] = useState(false)
  const audioRecorder = useRef<MediaRecorder | undefined>()
  const addExternalChange = useRef<(change: Record<string, unknown>) => void | undefined>()
  const trace = useRef<AceTrace | undefined>(undefined)

  const toggleRecording = useCallback(async () => {
    if (!editor.current || !canRecord.current) {
      setRecording(false)
      return
    }

    if (!recording) {
      try {
        audioRecorder.current = new MediaRecorder(await navigator.mediaDevices.getUserMedia({ audio: true }))
        const { stop, addExternalChange: add } = recorder(editor.current)
        addExternalChange.current = add

        const chunks: Blob[] = []
        audioRecorder.current.addEventListener("dataavailable", ({ data }) => chunks.push(data))
        audioRecorder.current.addEventListener("stop", () => {
          const audioUrl = window.URL.createObjectURL(new Blob(chunks, { type: "audio/ogg; codecs=opus" }))
          const editorTrace = stop()
          trace.current = { audioUrl, editorTrace }
          onRecordComplete && onRecordComplete(trace.current)
        })
        audioRecorder.current.start()
      } catch (err) {
        console.error(err)
        return
      }
    } else if (audioRecorder.current) {
      addExternalChange.current = undefined
      audioRecorder.current.stop()
    }
    setRecording(!recording)
  }, [setRecording, recording, onRecordComplete])

  const connectRace = id && record && canRecord.current
  if (connectRace) {
    commands.push({
      name: "record",
      bindKey: { win: "Ctrl-S", mac: "Ctrl-S" },
      exec: () => !recording && toggleRecording(),
    })
  }

  // Jeed integration
  const jeedContext = useJeed()

  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState<string>("")
  const [showOutput, setShowOutput] = useState(false)
  const [complexityAnnotations, setComplexityAnnotations] = useState<AceAnnotation[]>([])

  const run = useCallback(() => {
    const contents = editor.current?.getValue()
    if (!contents || (mode !== "java" && mode !== "kotlin")) {
      return
    }
    const job = createJeedJob(contents, {
      id: id || "jeed",
      mode,
      snippet,
      noCheckstyle,
      useContainer,
      checkForSnippet,
    })

    runJeedJob(job, jeedContext)
      .then(response => {
        console.debug(response)
        const output = terminalOutput(response)
        addExternalChange.current && addExternalChange.current(AceOutputChange.check({ what: "output", output }))
        setOutput(output !== "" ? output : "(Completed With No Output)")
        setShowOutput(true)
        setRunning(false)
        setComplexityAnnotations(complexity ? getComplexityAnnotations(response) : [])
      })
      .catch(err => {
        console.error(err)
        setOutput(`Error: ${err}`)
        setShowOutput(true)
        setRunning(false)
      })
  }, [id, mode, noCheckstyle, useContainer, snippet, jeedContext, complexity, checkForSnippet])

  useEffect(() => {
    addExternalChange.current &&
      addExternalChange.current(AceShowOutputChange.check({ what: "showoutput", state: showOutput ? "open" : "close" }))
  }, [showOutput])

  const connectJeed = jeedContext.available && (mode === "java" || mode === "kotlin") && !noJeed
  if (connectJeed) {
    commands.push(
      {
        name: "run",
        bindKey: { win: "Ctrl-Enter", mac: "Ctrl-Enter" },
        exec: () => !running && run(),
      },
      {
        name: "close",
        bindKey: { win: "Esc", mac: "Esc" },
        exec: () => setShowOutput(false),
      }
    )
  }

  const actuallyShowOutput = props.showOutput !== undefined ? props.showOutput : showOutput
  const actualOutput = props.output !== undefined ? props.output : output

  return (
    <div className={classes.top} style={wrapperStyle}>
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
        <Suspense fallback={<div />}>
          <div
            className={`${classes.wrapper} ${displayOnly ? "ace_display_only" : ""}`.trim()}
            style={{ display: showPlaceholder ? "none" : "block" }}
          >
            {!displayOnly && (
              <div
                className={classes.fakeGutter}
                style={{
                  width: gutterWidth + muiTheme.spacing(1) + 2,
                }}
              />
            )}
            {connectMace && (
              <div className={classes.overlaysWrapperTop} key="top">
                {editorContentsModified && editor.current && defaultValue && (
                  <RestoreButton editor={editor.current} defaultValue={defaultValue} />
                )}
                <SavingIndicator saving={maceLoading} />
              </div>
            )}
            {(connectJeed || connectRace) && (
              <div className={classes.overlaysWrapperBottom}>
                {connectJeed && <RunButton running={running} run={run} />}
                {connectRace && <RecordButton recording={recording} toggle={toggleRecording} />}
              </div>
            )}
            <AceEditor
              {...props}
              annotations={(annotations || []).concat(complexityAnnotations)}
              mode={mode}
              onBeforeLoad={ace => {
                ace.config.set("basePath", "https://cdn.jsdelivr.net/npm/ace-builds@1.4.11/src-min-noconflict")
                props.onBeforeLoad && props.onBeforeLoad(ace)
              }}
              onChange={value => defaultValue && setEditorContentsModified(value !== defaultValue)}
              onLoad={e => {
                editor.current = e

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const session = e.session as any
                session.gutterRenderer = {
                  getWidth: function () {
                    return gutterWidth
                  },
                  getText: function (session: { $firstLineNumber: number }, row: number) {
                    return !numbers ? "" : session.$firstLineNumber + row
                  },
                }

                if (!displayOnly && initialCursorPosition) {
                  e.moveCursorTo(initialCursorPosition[0], initialCursorPosition[1])
                }

                e.setHighlightActiveLine(false)
                e.setHighlightGutterLine(false)
                props.onLoad && props.onLoad(e)
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
          {actuallyShowOutput && (
            <div style={{ position: "relative", textAlign: "left" }}>
              <Paper
                variant="outlined"
                square
                className={classes.output}
                style={{ maxHeight: `${1.5 * maxOutputLines}em` }}
              >
                <CornerButton size={muiTheme.spacing(2)} color={grey.A200} onClick={() => setShowOutput(false)} />
                <Close className={classes.close} onClick={() => setShowOutput(false)} />
                {running && <Skeleton variant="rect" className={classes.terminalSkeleton} />}
                <pre className={classes.outputPre}>{actualOutput}</pre>
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
  noCheckstyle: PropTypes.bool,
  useContainer: PropTypes.bool,
  checkForSnippet: PropTypes.bool,
  snippet: PropTypes.bool,
  complexity: PropTypes.bool,
  annotations: PropTypes.array,
  wrapperStyle: PropTypes.any,
  maxOutputLines: PropTypes.number,
  record: PropTypes.bool,
  replaying: PropTypes.bool,
  onRecordComplete: PropTypes.func,
  showOutput: PropTypes.bool,
  output: PropTypes.string,
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
  noCheckstyle: false,
  useContainer: false,
  checkForSnippet: false,
  snippet: false,
  complexity: false,
  wrapperStyle: {},
  maxOutputLines: 16,
}

export const AceOutputChange = RuntypeRecord({
  what: Literal("output"),
  output: RuntypeString,
})
export type AceOutputChange = Static<typeof AceOutputChange>

export const AceShowOutputChange = RuntypeRecord({
  what: Literal("showoutput"),
  state: Union(Literal("open"), Literal("close")),
})
export type AceShowOutputChange = Static<typeof AceShowOutputChange>

export const AceChanges = Union(AceOutputChange, AceShowOutputChange)
export type AceChanges = Static<typeof AceChanges>
