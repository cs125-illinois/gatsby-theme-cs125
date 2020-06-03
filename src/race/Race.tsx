import React, { useRef, useState, useCallback } from "react"

import AceEditor from "react-ace"
import { IAceEditor } from "react-ace/lib/types"

import { Record, String, Partial, Static, Number, Array, Union, Literal } from "runtypes"
import { AceProps, Ace } from "src/react-ace/Ace"
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
  action: String,
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

type recordAce = (editor: IAceEditor) => () => Records[]
const recordAce: recordAce = editor => {
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
}))

export const Race: React.FC<AceProps> = props => {
  const theme = useTheme()
  const classes = useStyles()

  const editor = useRef<IAceEditor | undefined>(undefined)
  const recorder = useRef<(() => Records[]) | undefined>(undefined)

  const [recording, setRecording] = useState(false)
  const toggleRecording = useCallback(() => {
    if (!editor.current) {
      setRecording(false)
      return
    }
    if (!recording) {
      recorder.current = recordAce(editor.current)
    } else if (recorder.current) {
      const records = recorder.current()
      console.log(records)
    }
    setRecording(!recording)
  }, [setRecording, recording])

  return (
    <Ace
      {...props}
      overlays={
        <div className={classes.wrapper}>
          <IconButton className={classes.button} onClick={toggleRecording}>
            <Album className={classes.icon} />
          </IconButton>
          {recording && <CircularProgress disableShrink size={theme.spacing(3)} className={classes.loading} />}
        </div>
      }
      onLoad={e => {
        console.log("Here")
        editor.current = e
        props.onLoad && props.onLoad(e)
      }}
    />
  )
}
Race.propTypes = {
  ...AceEditor.propTypes,
}
