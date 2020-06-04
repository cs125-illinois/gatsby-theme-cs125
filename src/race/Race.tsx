import React, { useRef, useState, useCallback } from "react"
import PropTypes from "prop-types"

import AceEditor from "react-ace"
import { IAceEditor } from "react-ace/lib/types"

import { Record, String, Partial, Static, Number, Array, Union, Literal } from "runtypes"
import { AceProps, Ace } from "../react-ace/Ace"
import { IconButton, useTheme, makeStyles, CircularProgress } from "@material-ui/core"
import { Album } from "@material-ui/icons/"
import { red } from "@material-ui/core/colors"

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

const SelectionChange = Record({
  type: Literal("selectionchange"),
  timestamp: String.withConstraint(s => Date.parse(s) !== NaN),
  start: EditorLocation,
  end: EditorLocation,
})
type SelectionChange = Static<typeof SelectionChange>

const CursorChange = Record({
  type: Literal("cursorchange"),
  timestamp: String.withConstraint(s => Date.parse(s) !== NaN),
  location: EditorLocation,
})
type CursorChange = Static<typeof CursorChange>

const ScrollChange = Record({
  type: Literal("scrollchange"),
  timestamp: String.withConstraint(s => Date.parse(s) !== NaN),
  top: Number,
  left: Number,
})
type ScrollChange = Static<typeof ScrollChange>

const Records = Union(Complete, Delta, SelectionChange, CursorChange, ScrollChange)
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

  const changeListener = (delta: { [key: string]: unknown }) => {
    records.push(Delta.check({ ...delta, type: "delta", timestamp: new Date().toISOString() }))
  }
  const selectionListener = () => {
    records.push(
      SelectionChange.check({
        type: "selectionchange",
        timestamp: new Date().toISOString(),
        ...editor.selection.getRange(),
      })
    )
  }
  const cursorListener = () => {
    records.push(
      CursorChange.check({
        type: "cursorchange",
        timestamp: new Date().toISOString(),
        location: editor.selection.getCursor(),
      })
    )
  }
  const scrollListener = throttle(100, () => {
    records.push(
      ScrollChange.check({
        type: "scrollchange",
        timestamp: new Date().toISOString(),
        top: editor.renderer.getScrollTop(),
        left: editor.renderer.getScrollLeft(),
      })
    )
  })

  const timer = setInterval(() => {
    records.push(fullAceSnapshot(editor, "internal"))
  }, 1000)
  editor.addEventListener("change", changeListener)
  editor.addEventListener("changeSelection", selectionListener)
  editor.addEventListener("changeCursor", cursorListener)
  editor.session.addEventListener("changeScrollTop", scrollListener)
  return () => {
    clearInterval(timer)
    editor.removeEventListener("change", changeListener)
    editor.removeEventListener("changeSelection", selectionListener)
    editor.removeEventListener("changeCursor", cursorListener)
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

  const wasReadOnly = editor.getReadOnly()
  editor.setReadOnly(true)

  let cancelled = false
  acePlayer.promise = new Promise(async resolve => {
    const { start } = options

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
        const { top, left } = record.scroll
        editor.renderer.scrollToY(top)
        editor.renderer.scrollToX(left)
      } else if (Delta.guard(record)) {
        editor.session.getDocument().applyDelta(record)
      } else if (SelectionChange.guard(record)) {
        editor.selection.setSelectionRange(record)
      } else if (CursorChange.guard(record)) {
        const { row, column } = record.location
        editor.selection.moveCursorTo(row, column)
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
    console.log(audioPlayer.current.currentTime)
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
