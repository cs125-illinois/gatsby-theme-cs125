import React, { useRef, useState, useCallback } from "react"
import PropTypes from "prop-types"

import AceEditor from "react-ace"
import { IAceEditor } from "react-ace/lib/types"

import { Record, String, Partial, Static, Number, Array, Union, Literal } from "runtypes"
import { AceProps, Ace } from "../react-ace/Ace"
import IconButton from "@material-ui/core/IconButton"
import useTheme from "@material-ui/core/styles/useTheme"
import makeStyles from "@material-ui/core/styles/makeStyles"
import CircularProgress from "@material-ui/core/CircularProgress"

import Album from "@material-ui/icons/Album"
import red from "@material-ui/core/colors/red"

import { throttle } from "throttle-debounce"

const EditorLocation = Record({
  row: Number,
  column: Number,
})
type EditorLocation = Static<typeof EditorLocation>

const Complete = Record({
  type: Literal("complete"),
  location: Union(Literal("start"), Literal("end"), Literal("internal")),
  timestamp: String.withConstraint(s => Date.parse(s) !== NaN),
  value: String,
  selection: Record({
    start: EditorLocation,
    end: EditorLocation,
  }),
  cursor: EditorLocation,
  scroll: Record({
    top: Number,
    left: Number,
  }),
})
type Complete = Static<typeof Complete>

const Delta = Record({
  type: Literal("delta"),
  timestamp: String.withConstraint(s => Date.parse(s) !== NaN),
  start: EditorLocation,
  end: EditorLocation,
  action: Union(Literal("insert"), Literal("remove")),
  lines: Array(String),
}).And(
  Partial({
    id: Number,
  })
)
type Delta = Static<typeof Delta>

const Selection = Record({
  start: EditorLocation,
  end: EditorLocation,
})
type Selection = Static<typeof Selection>

const SelectionChange = Record({
  type: Literal("selectionchange"),
  timestamp: String.withConstraint(s => Date.parse(s) !== NaN),
  start: EditorLocation,
  end: EditorLocation,
})
type SelectionChange = Static<typeof SelectionChange>

const ScrollPosition = Record({
  top: Number,
  left: Number,
})
type ScrollPosition = Static<typeof ScrollPosition>

const ScrollChange = Record({
  type: Literal("scrollchange"),
  timestamp: String.withConstraint(s => Date.parse(s) !== NaN),
  top: Number,
  left: Number,
})
type ScrollChange = Static<typeof ScrollChange>

const Records = Union(Complete, Delta, SelectionChange, ScrollChange)
type Records = Static<typeof Records>

const fullAceSnapshot = (editor: IAceEditor, location: string): Complete =>
  Complete.check({
    type: "complete",
    location,
    timestamp: new Date().toISOString(),
    value: editor.getValue(),
    selection: editor.selection.getRange(),
    cursor: editor.selection.getCursor(),
    scroll: {
      top: editor.renderer.getScrollTop(),
      left: editor.renderer.getScrollLeft(),
    },
  })
const recordAce: (editor: IAceEditor) => () => Records[] = editor => {
  const records: Records[] = [fullAceSnapshot(editor, "start")]

  let lastValue = editor.getValue()
  const changeListener = (delta: { [key: string]: unknown }) => {
    if (editor.getValue() === lastValue) {
      return
    }
    lastValue = editor.getValue()
    records.push(Delta.check({ ...delta, type: "delta", timestamp: new Date().toISOString() }))
  }

  let lastSelection = Selection.check(editor.selection.getRange())
  const selectionListener = () => {
    const selection = Selection.check(editor.selection.getRange())
    if (
      selection.start.column === lastSelection.start.column &&
      selection.start.row === lastSelection.start.row &&
      selection.end.column === lastSelection.end.column &&
      selection.end.row === lastSelection.end.row
    ) {
      return
    }

    const cursor = editor.selection.getCursor()
    if (
      selection.start.column === selection.end.column &&
      selection.end.row === selection.end.row &&
      selection.start.column === cursor.column &&
      selection.start.row === cursor.row
    ) {
      return
    }

    lastSelection = selection

    records.push(
      SelectionChange.check({
        type: "selectionchange",
        timestamp: new Date().toISOString(),
        ...selection,
      })
    )
  }

  let lastScroll = ScrollPosition.check({ top: editor.renderer.getScrollTop(), left: editor.renderer.getScrollLeft() })
  const scrollListener = throttle(100, () => {
    const scroll = ScrollPosition.check({ top: editor.renderer.getScrollTop(), left: editor.renderer.getScrollLeft() })
    if (scroll.top === lastScroll.top && scroll.left === lastScroll.left) {
      return
    }
    lastScroll = scroll
    records.push(
      ScrollChange.check({
        type: "scrollchange",
        timestamp: new Date().toISOString(),
        ...scroll,
      })
    )
  })

  const timer = setInterval(() => {
    records.push(fullAceSnapshot(editor, "internal"))
  }, 1000)
  editor.session.addEventListener("change", changeListener)
  editor.addEventListener("changeSelection", selectionListener)
  editor.session.addEventListener("changeScrollTop", scrollListener)
  return () => {
    clearInterval(timer)
    editor.session.removeEventListener("change", changeListener)
    editor.removeEventListener("changeSelection", selectionListener)
    editor.session.removeEventListener("changeScrollTop", scrollListener)

    records.push(fullAceSnapshot(editor, "end"))
    return records
  }
}
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

interface AcePlayer {
  promise: Promise<void>
  cancel: () => void
}
const replayAce: (editor: IAceEditor, trace: Records[], options?: { start: number }) => AcePlayer = (
  editor,
  trace,
  options = { start: 0 }
) => {
  const acePlayer: AcePlayer = {} as AcePlayer

  let cancelled = false
  acePlayer.promise = new Promise(async resolve => {
    const { start } = options

    const wasReadOnly = editor.getReadOnly()
    editor.setReadOnly(true)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderer = editor.renderer as any
    const wasVisible = renderer.$cursorLayer.isVisible
    renderer.$cursorLayer.isVisible = true
    const wasBlinking = renderer.$cursorLayer.isBlinking
    renderer.$cursorLayer.setBlinking(true)
    const previousOpacity = renderer.$cursorLayer.element.style.opacity
    renderer.$cursorLayer.element.style.opacity = 1

    const startTime = new Date().valueOf()
    const traceStartTime = Date.parse(trace[0].timestamp).valueOf()

    let startIndex = 0
    if (start > 0) {
      let i = 0
      for (; i < trace.length; i++) {
        const record = trace[i]
        const currentTime = Date.parse(record.timestamp).valueOf() - traceStartTime
        if (currentTime < start && Complete.guard(record)) {
          startIndex = i
        }
      }
    }

    for (let i = startIndex; i < trace.length && !cancelled; i++) {
      const record = trace[i]
      if (Complete.guard(record)) {
        if (editor.getValue() !== record.value) {
          editor.setValue(record.value)
        }
        const { row, column } = record.cursor
        editor.selection.moveCursorTo(row, column)
        editor.selection.setSelectionRange({ start: { row, column }, end: { row, column } })
        const { top, left } = record.scroll
        editor.renderer.scrollToY(top)
        editor.renderer.scrollToX(left)
      } else if (Delta.guard(record)) {
        editor.session.getDocument().applyDelta(record)
      } else if (SelectionChange.guard(record)) {
        editor.selection.setSelectionRange(record)
      } else if (ScrollChange.guard(record)) {
        const { top, left } = record
        editor.renderer.scrollToY(top)
        editor.renderer.scrollToX(left)
      }

      if (trace[i + 1]) {
        const traceNextTime = Date.parse(trace[i + 1].timestamp).valueOf()
        const nextTime = startTime + (traceNextTime - (traceStartTime + start))
        const delay = nextTime - new Date().valueOf()
        if (delay > 0) {
          await sleep(delay)
        }
      }
    }

    editor.setReadOnly(wasReadOnly)

    renderer.$cursorLayer.isVisible = wasVisible
    renderer.$cursorLayer.setBlinking(wasBlinking)
    renderer.$cursorLayer.element.style.opacity = previousOpacity

    resolve()
  })
  acePlayer.cancel = () => {
    cancelled = true
  }
  return acePlayer
}

const useStyles = makeStyles(theme => ({
  wrapper: {
    position: "absolute",
    bottom: theme.spacing(0),
    right: theme.spacing(0),
  },
  button: {
    padding: theme.spacing(0),
    zIndex: 10,
    color: red.A700,
  },
  icon: {
    fontSize: theme.spacing(3),
  },
  loading: {
    position: "absolute",
    top: 2,
    left: 0,
    color: red.A400,
  },
  player: {
    width: "100%",
    height: theme.spacing(4),
  },
}))

export const Race: React.FC<AceProps> = props => {
  const theme = useTheme()
  const classes = useStyles()

  const canRecord = useRef(
    typeof navigator !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.getUserMedia
  )
  const editor = useRef<IAceEditor | undefined>(undefined)
  const aceRecorder = useRef<(() => Records[]) | undefined>(undefined)
  const audioRecorder = useRef<MediaRecorder | undefined>(undefined)

  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined)
  const [editorTrace, setEditorTrace] = useState<Records[] | undefined>(undefined)

  const toggleRecording = useCallback(async () => {
    if (!editor.current || !canRecord.current) {
      setRecording(false)
      return
    }

    if (!recording) {
      try {
        audioRecorder.current = new MediaRecorder(await navigator.mediaDevices.getUserMedia({ audio: true }))
        const chunks: Blob[] = []
        audioRecorder.current.addEventListener("dataavailable", ({ data }) => chunks.push(data))
        audioRecorder.current.addEventListener("stop", () => {
          setAudioUrl(window.URL.createObjectURL(new Blob(chunks, { type: "audio/ogg; codecs=opus" })))
        })
      } catch (err) {
        console.error(err)
        return
      }
      setEditorTrace([])
      audioRecorder.current.start()
      aceRecorder.current = recordAce(editor.current)
    } else if (aceRecorder.current && audioRecorder.current) {
      audioRecorder.current.stop()
      setEditorTrace(aceRecorder.current())
    }
    setRecording(!recording)
  }, [setRecording, recording])

  return (
    <>
      <Ace
        {...props}
        overlays={
          canRecord && (
            <div className={classes.wrapper}>
              <IconButton className={classes.button} onClick={toggleRecording}>
                <Album className={classes.icon} />
              </IconButton>
              {recording && <CircularProgress disableShrink size={theme.spacing(3)} className={classes.loading} />}
            </div>
          )
        }
        onLoad={e => {
          editor.current = e
          props.onLoad && props.onLoad(e)
        }}
      />
      {editor.current && audioUrl && editorTrace && (
        <AceReplayer aceTrace={{ audioUrl, editorTrace }} editor={editor.current} />
      )}
    </>
  )
}
Race.propTypes = {
  ...AceEditor.propTypes,
}

export interface AceTrace {
  audioUrl: string
  editorTrace: Records[]
}
export interface AceReplayerProps {
  aceTrace: AceTrace
  editor: IAceEditor
}
export const AceReplayer: React.FC<AceReplayerProps> = ({ aceTrace, editor }) => {
  const classes = useStyles()

  const audioPlayer = useRef<HTMLAudioElement | null>(null)
  const playingTrace = useRef<AcePlayer | undefined>(undefined)

  const startTrace = useCallback(() => {
    if (!audioPlayer.current) {
      return
    }
    playingTrace.current && playingTrace.current.cancel()
    playingTrace.current = replayAce(editor, aceTrace.editorTrace, {
      start: Math.round(audioPlayer.current.currentTime * 1000),
    })
  }, [aceTrace, editor])
  const stopTrace = useCallback(() => {
    playingTrace.current && playingTrace.current.cancel()
  }, [])

  return (
    <audio
      ref={audioPlayer}
      className={classes.player}
      controls
      src={aceTrace.audioUrl}
      onPlay={startTrace}
      onEnded={stopTrace}
      onPause={stopTrace}
    />
  )
}
AceReplayer.propTypes = {
  aceTrace: PropTypes.any.isRequired,
  editor: PropTypes.any.isRequired,
}
