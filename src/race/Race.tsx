import React, { useRef, useCallback, useState } from "react"

import { IAceEditor } from "react-ace/lib/types"
import { AceReplayer, replay } from "@cs125/monace"

import makeStyles from "@material-ui/core/styles/makeStyles"
import { AceProps, Ace, AceTrace } from "../react-ace/Ace"

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
    })
    setReplaying(true)
  }, [])
  const stopTrace = useCallback(() => {
    playingTrace.current && playingTrace.current.stop()
    setReplaying(false)
  }, [])

  return (
    <div>
      <Ace
        {...props}
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
