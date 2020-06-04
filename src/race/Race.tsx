import React, { useRef, useState, useCallback } from "react"

import AceEditor from "react-ace"
import { IAceEditor } from "react-ace/lib/types"

import { Record, String, Partial, Static, Number, Array, Union, Literal } from "runtypes"
import { AceProps, Ace } from "../react-ace/Ace"
import { IconButton, useTheme, makeStyles, CircularProgress } from "@material-ui/core"
import { Album } from "@material-ui/icons/"
import { red } from "@material-ui/core/colors"

const DeltaLocation = Record({
  row: Number,
  column: Number,
})
type DeltaLocation = Static<typeof DeltaLocation>

const Delta = Record({
  type: Literal("delta"),
  timestamp: String.withConstraint(s => Date.parse(s) !== NaN),
  start: DeltaLocation,
  end: DeltaLocation,
  action: Union(Literal("insert"), Literal("remove")),
  lines: Array(String),
}).And(
  Partial({
    id: Number,
  })
)
type Delta = Static<typeof Delta>

const Complete = Record({
  type: Literal("complete"),
  location: Union(Literal("start"), Literal("end"), Literal("internal")),
  timestamp: String.withConstraint(s => Date.parse(s) !== NaN),
  value: String,
})
type Complete = Static<typeof Complete>

const Records = Union(Delta, Complete)
type Records = Static<typeof Records>

const recordAce: (editor: IAceEditor) => () => Records[] = editor => {
  const records: Records[] = [
    Complete.check({
      type: "complete",
      location: "start",
      timestamp: new Date().toISOString(),
      value: editor.getValue(),
    }),
  ]

  const changeListener = (delta: { [key: string]: unknown }) => {
    records.push(Delta.check({ ...delta, type: "delta", timestamp: new Date().toISOString() }))
  }
  editor.addEventListener("change", changeListener)

  return () => {
    editor.removeEventListener("change", changeListener)
    records.push(
      Complete.check({
        type: "complete",
        location: "end",
        timestamp: new Date().toISOString(),
        value: editor.getValue(),
      })
    )
    return records
  }
}
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

interface AcePlayer {
  promise: Promise<void>
  cancel: () => void
}
const replayAce: (editor: IAceEditor, trace: Records[]) => AcePlayer = (editor, trace) => {
  const acePlayer: AcePlayer = {} as AcePlayer

  let cancelled = false
  acePlayer.promise = new Promise(async resolve => {
    const startTime = new Date().valueOf()
    const traceStartTime = Date.parse(trace[0].timestamp).valueOf()

    for (let i = 0; i < trace.length && !cancelled; i++) {
      const record = trace[i]
      if (Complete.guard(record)) {
        editor.setValue(record.value)
      } else if (Delta.guard(record)) {
        editor.session.getDocument().applyDelta(record)
      }

      if (trace[i + 1]) {
        const traceNextTime = Date.parse(trace[i + 1].timestamp).valueOf()
        const nextTime = startTime + (traceNextTime - traceStartTime)
        await sleep(nextTime - new Date().valueOf())
      }
    }

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
      const records = aceRecorder.current()
      replayAce(editor.current, records)
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
      {audioUrl && <audio className={classes.player} controls src={audioUrl} />}
    </>
  )
}
Race.propTypes = {
  ...AceEditor.propTypes,
}
