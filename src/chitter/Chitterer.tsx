import React, { useEffect, useState, useCallback, useRef } from "react"
import PropTypes from "prop-types"

import sortBy from "lodash/sortBy"
import uniqBy from "lodash/uniqBy"

// Note that we're already wrapped this component with a ChitterProvider in wrapRootElement.tsx
// So all we need here is the context provider and a type
import { RoomID, useChitter, JoinResponse, ChitterMessage } from "@cs125/chitter"
import { useGoogleUser, useBasicGoogleProfile } from "@cs125/react-google-login"

// Various bits of the Material UI framework
// We try to use this style of import since it leads to smaller bundles,
// but this is just an example component so it doesn't really matter that much
import makeStyles from "@material-ui/core/styles/makeStyles"

import useTimeout from "@rooks/use-timeout"

import { LoginButton } from "../react-google-login"
import { MarkdownMessages } from "./MarkdownMessages"
import { MarkdownTextField } from "./MarkdownTextField"
import { CircularProgress } from "@material-ui/core"

// Set up styles for the various parts of our little UI
// makeStyles allows us to use the passed theme as needed, which we don't do here (yet)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStyles = makeStyles(_ => ({
  chitterer: {
    width: "100%",
    border: "1px solid grey",
    padding: 8,
    paddingRight: 0,
    position: "relative",
    overflow: "hidden",
    display: "flex",
    justifyContent: "flex-end",
    flexDirection: "column",
    height: 256,
    resize: "vertical",
  },
  waiting: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4);",
    display: "flex",
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    display: "flex",
    flexDirection: "row",
  },
}))

export interface ChittererProps extends React.HTMLAttributes<HTMLDivElement> {
  room: RoomID
  email?: string
  name?: string
}

const gravatarOptions = {
  r: "pg",
  d: encodeURI("https://cs125.cs.illinois.edu/img/logos/cs125-with-border-120x120.png"),
}

export const Chitterer: React.FC<ChittererProps> = ({ room, ...props }) => {
  const { connected, join } = useChitter()
  const { isSignedIn } = useGoogleUser()
  const { email: actualEmail, name: actualName } = useBasicGoogleProfile()
  const classes = useStyles()

  const chitter = useRef<JoinResponse | undefined>()
  const waitingFor = useRef<string>()
  const inputRef = useRef<{ clear: () => void }>(null)
  const messagesRef = useRef<{ scrollToBottom: () => void }>(null)

  const [joined, setJoined] = useState(false)
  const [errored, setErrored] = useState(false)
  const [showWaiting, setShowWaiting] = useState(false)
  const [messages, setMessages] = useState<ChitterMessage[]>([])

  const { start, clear } = useTimeout(() => setShowWaiting(true), 2048)

  const email = props.email || actualEmail
  const name = props.name || actualName

  useEffect(() => {
    start()
    return () => clear()
  }, [start, clear])

  useEffect(() => {
    if (connected) {
      const onReceive = (received: ChitterMessage) => {
        // There is an opportunity here to distribute other types of messages in other ways...
        if (received.messageType === "markdown" || received.messageType === "text") {
          setMessages(messages => sortBy(uniqBy([...messages, received], "id"), ({ unixtime }) => unixtime))
        }
        if (received.id === waitingFor.current) {
          inputRef.current?.clear()
          messagesRef.current?.scrollToBottom()
        }
      }
      const onJoin = (joined: boolean) => {
        setJoined(joined)
        setErrored(!joined)
        joined && chitter.current?.request(new Date(), 4)
      }
      chitter.current = join({ room, onReceive, onJoin, sendOptions: { email, name } })
    }
    return () => chitter.current?.leave()
  }, [connected, join, room, email, name, setMessages])

  const onNewMessage = useCallback(
    (contents: string) => {
      if (chitter.current && joined) {
        waitingFor.current = chitter.current.send("markdown", contents)
      }
    },
    [joined]
  )

  let waitingElement = null
  if (!isSignedIn) {
    waitingElement = (
      <div className={classes.waiting}>
        <LoginButton />
      </div>
    )
  } else if (!joined || errored) {
    if (!showWaiting) {
      waitingElement = <div className={classes.waiting} />
    } else if (!joined) {
      waitingElement = (
        <div className={classes.waiting}>
          <div>
            Joining Room...
            <CircularProgress />
          </div>
        </div>
      )
    }
  }

  // Pass props through to the top-level div to allow external styling
  return (
    <div className={classes.chitterer} {...props}>
      {waitingElement || (
        <MarkdownMessages
          ref={messagesRef}
          messages={messages}
          email={email as string}
          gravatarOptions={gravatarOptions}
        />
      )}
      <MarkdownTextField
        ref={inputRef}
        onNewMessage={onNewMessage}
        email={email as string}
        gravatarOptions={gravatarOptions}
        placeholder="Send"
      />
    </div>
  )
}

Chitterer.propTypes = {
  room: PropTypes.string.isRequired,
  style: PropTypes.any,
  email: PropTypes.string,
  name: PropTypes.string,
}
