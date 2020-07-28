import React, { useEffect, useState, useCallback, useRef } from "react"
import PropTypes from "prop-types"

import sortBy from "lodash/sortBy"
import uniqBy from "lodash/uniqBy"

// Note that we're already wrapped this component with a ChitterProvider in wrapRootElement.tsx
// So all we need here is the context provider and a type
import {
  RoomID,
  useChitter,
  JoinResponse,
  ChitterMessage,
  ChitterMessageType,
  ChitterMessageRequest,
} from "@cs125/chitter"
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

export interface PendingChitterMessage extends ChitterMessage {
  pending?: boolean
}
export const Chitterer: React.FC<ChittererProps> = ({ room, ...props }) => {
  const { connected, join } = useChitter()
  const { isSignedIn } = useGoogleUser()
  const { email: actualEmail, name: actualName } = useBasicGoogleProfile()
  const classes = useStyles()

  const chitter = useRef<JoinResponse | undefined>()
  const inputRef = useRef<{ clear: () => void }>(null)
  const messagesRef = useRef<{ scrollToBottom: () => void }>(null)
  const waitingFor = useRef<PendingChitterMessage | undefined>()

  const [joined, setJoined] = useState(false)
  const [errored, setErrored] = useState(false)
  const [showWaiting, setShowWaiting] = useState(false)
  const [messageWaiting, setMessageWaiting] = useState(false)
  const [messages, setMessages] = useState<PendingChitterMessage[]>([])

  const { start, clear } = useTimeout(() => setShowWaiting(true), 2048)
  const { start: startMessage, clear: clearMessage } = useTimeout(() => setMessageWaiting(true), 1024)

  const email = props.email || actualEmail
  const name = props.name || actualName

  useEffect(() => {
    start()
    return () => clear()
  }, [start, clear])

  const onReceive = useCallback(
    (received: ChitterMessage) => {
      // There is an opportunity here to distribute other types of messages in other ways...
      if (received.messageType === "markdown" || received.messageType === "text") {
        setMessages(messages => {
          const merged = received.new
            ? [...messages.filter(m => !m.pending), received]
            : [received, ...messages.filter(m => !m.pending)]
          return sortBy(uniqBy(merged, "id"), ({ unixtime }) => unixtime)
        })
      }
      if (waitingFor.current && received.id === waitingFor.current.id) {
        inputRef.current?.clear()
        messagesRef.current?.scrollToBottom()
        waitingFor.current = undefined
        setMessageWaiting(false)
        clearMessage()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setMessageWaiting]
  )

  const onJoin = useCallback((joined: boolean) => {
    setJoined(joined)
    setErrored(!joined)
    joined && chitter.current?.request(new Date(), 32)
  }, [])

  useEffect(() => {
    if (connected) {
      chitter.current = join({ room, onReceive, onJoin, sendOptions: { email, name } })
    }
    return () => chitter.current?.leave()
  }, [connected, join, room, onReceive, onJoin, email, name])

  const onNewMessage = useCallback(
    (contents: string) => {
      if (chitter.current) {
        const { id, view, room, messageType, email, name } = chitter.current.send(
          "markdown",
          contents
        ) as ChitterMessageRequest
        startMessage()
        const now = new Date()
        waitingFor.current = ChitterMessage.check({
          type: ChitterMessageType,
          id,
          view,
          room,
          messageType,
          contents,
          email: email || actualEmail,
          name: name || actualName,
          new: true,
          timestamp: now,
          unixtime: now.valueOf(),
          pending: true,
        })
        setMessages(messages => [...messages, waitingFor.current as PendingChitterMessage])
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [actualEmail, actualName, setMessages]
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
          waiting={messageWaiting}
          messages={messages}
          email={email as string}
          gravatarOptions={gravatarOptions}
        />
      )}
      <MarkdownTextField
        ref={inputRef}
        waiting={messageWaiting}
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
