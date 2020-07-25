import React, { forwardRef, useImperativeHandle, useRef } from "react"
import PropTypes from "prop-types"

import gravatar from "gravatar"
import Avatar from "@material-ui/core/Avatar"
import ReactMarkdown from "react-markdown"
import makeStyles from "@material-ui/core/styles/makeStyles"
import moment from "moment-timezone"

import { P, Pre } from "../mdx"
import { Ace } from "../react-ace"

import { String } from "runtypes"
import Typography from "@material-ui/core/Typography"
import { useTheme } from "@material-ui/core/styles"

import { PendingChitterMessage } from "./Chitterer"
import { CircularProgress } from "@material-ui/core"

import { Virtuoso, VirtuosoMethods } from "react-virtuoso"

const Paragraph: React.FC = ({ children }) => <P style={{ marginBottom: 8, marginTop: 8 }}>{children}</P>
Paragraph.propTypes = {
  children: PropTypes.node.isRequired,
}

const Code: React.FC<{ language?: string; value: string }> = ({ language, value, ...props }) => {
  return (
    <Ace mode={language || "sh"} {...props} wrapperStyle={{ marginTop: 0, marginBottom: 8 }} checkForSnippet readOnly>
      {value}
    </Ace>
  )
}
Code.propTypes = {
  language: PropTypes.string,
  value: PropTypes.string.isRequired,
}

const renderers = {
  paragraph: Paragraph,
  heading: Paragraph,
  code: Code,
  pre: Pre,
}

const useStyles = makeStyles({
  message: {
    flex: 1,
    display: "flex",
    position: "relative",
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
})

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone

export interface MarkdownMessagesProps extends React.HTMLAttributes<HTMLDivElement> {
  email: string
  waiting: boolean
  messages: PendingChitterMessage[]
  gravatarOptions?: gravatar.Options
}
// eslint-disable-next-line react/display-name
export const MarkdownMessages = forwardRef<{ scrollToBottom: () => void }, MarkdownMessagesProps>(
  ({ email, waiting, messages, gravatarOptions = {} }, ref) => {
    const classes = useStyles()
    const theme = useTheme()

    const virtuosoRef = useRef<VirtuosoMethods>(null)

    useImperativeHandle(ref, () => ({
      scrollToBottom: () => {
        virtuosoRef.current?.scrollToIndex(messages.length)
      },
    }))

    const now = new Date()

    const Message = (index: number) => {
      const message = messages[index]
      const source = String.check(message.contents)
      const mine = message.email === email
      const pending = message.pending

      let component
      if (message.messageType === "markdown") {
        component = <ReactMarkdown source={source} renderers={renderers} />
      } else if (message.messageType === "text") {
        component = <>{source}</>
      } else {
        throw new Error(`Unsupport message type: ${message.messageType}`)
      }

      const timestamp = moment(message.timestamp)
      const format = timestamp.isSame(now, "day")
        ? "h:mm a"
        : timestamp.isSame(now, "year")
        ? "M/D h:mm a"
        : "M/D/YYYY h:mm a"
      const timestring = moment(message.timestamp).tz(tz).format(format)

      return (
        <div key={index} className={classes.message} style={{ flexDirection: mine ? "row-reverse" : "row" }}>
          {pending && waiting && (
            <div className={classes.waiting}>
              <CircularProgress size={16} />
              <Typography variant={"caption"} style={{ marginLeft: 8 }}>
                Sending...
              </Typography>
            </div>
          )}
          <Avatar
            src={gravatar.url(message.email as string, gravatarOptions)}
            style={{ marginLeft: mine ? 8 : 4, marginRight: 12 }}
          />
          <div style={{ flex: 1, textAlign: mine ? "right" : "left" }}>
            {component}
            <Typography
              component="p"
              variant="caption"
              style={{ fontSize: "0.8em", marginTop: -8, marginBottom: 8, color: theme.palette.text.disabled }}
            >
              {message.name} @ {timestring}
            </Typography>
          </div>
        </div>
      )
    }

    return <Virtuoso ref={virtuosoRef} totalCount={messages.length} item={Message} followOutput={true} />
  }
)
MarkdownMessages.propTypes = {
  email: PropTypes.string.isRequired,
  waiting: PropTypes.bool.isRequired,
  messages: PropTypes.array.isRequired,
  gravatarOptions: PropTypes.any,
}
