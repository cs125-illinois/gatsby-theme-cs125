import React, { useRef, useCallback, useState } from "react"

import { IAceEditor } from "react-ace/lib/types"
import { AceReplayer, replay, ExternalChange } from "@cs125/monace"

import makeStyles from "@material-ui/core/styles/makeStyles"
import { AceProps, Ace, AceTrace, AceChanges, AceOutputChange, AceShowOutputChange } from "../react-ace/Ace"

const useStyles = makeStyles(theme => ({
  player: {
    width: "100%",
    height: theme.spacing(4),
  },
}))

export const Race: React.FC<AceProps> = props => {
  const classes = useStyles()

  const [replaying, setReplaying] = useState(false)
  const [trace, setTrace] = useState<AceTrace | undefined>()

  const [output, setOutput] = useState<string | undefined>()
  const [showOutput, setShowOutput] = useState<boolean | undefined>()

  const editor = useRef<IAceEditor>()
  const audioPlayer = useRef<HTMLAudioElement>(null)
  const playingTrace = useRef<AceReplayer | undefined>(undefined)

  const startTrace = useCallback(trace => {
    if (!audioPlayer.current || !editor.current || !trace) {
      return
    }
    playingTrace.current && playingTrace.current.stop()
    playingTrace.current = replay(editor.current, trace.editorTrace, {
      start: Math.round(audioPlayer.current.currentTime * 1000),
      onExternalChange: (externalChange: ExternalChange) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { type, timestamp, ...change } = externalChange
        AceChanges.check(change)
        if (AceOutputChange.guard(change)) {
          setOutput(change.output)
        } else if (AceShowOutputChange.guard(change)) {
          setShowOutput(change.state === "open")
        }
      },
    })
    setReplaying(true)
  }, [])
  const stopTrace = useCallback(() => {
    playingTrace.current && playingTrace.current.stop()
    setShowOutput(undefined)
    setOutput(undefined)
    setReplaying(false)
  }, [])

  return (
    <div>
      <Ace
        {...props}
        output={output}
        showOutput={showOutput}
        onRecordComplete={t => setTrace(t)}
        onLoad={e => {
          editor.current = e
        }}
        replaying={replaying}
      />
      {trace && (
        <audio
          ref={audioPlayer}
          className={classes.player}
          controls
          src={trace.audioUrl}
          onPlay={() => startTrace(trace)}
          onEnded={stopTrace}
          onPause={stopTrace}
        />
      )}
    </div>
  )
}
