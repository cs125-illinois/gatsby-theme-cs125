import React, { forwardRef, useImperativeHandle, useRef, useEffect, useCallback } from "react"
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
import { ChitterMessage } from "@cs125/chitter"

import useMutationObserver from "@rooks/use-mutation-observer"

const Paragraph: React.FC = ({ children }) => <P style={{ marginBottom: 8, marginTop: 8 }}>{children}</P>
Paragraph.propTypes = {
  children: PropTypes.node.isRequired,
}
const Code: React.FC<{ language?: string }> = ({ language, ...props }) => {
  return <Ace mode={language || "sh"} {...props} wrapperStyle={{ marginTop: 0, marginBottom: 8 }} />
}
Code.propTypes = {
  language: PropTypes.string,
}
const renderers = {
  paragraph: Paragraph,
  heading: Paragraph,
  code: Code,
  pre: Pre,
}

const useStyles = makeStyles({
  messages: {
    display: "flex",
    flexDirection: "column",
    overflowY: "scroll",
  },
  message: {
    flex: 1,
    display: "flex",
  },
})

const tz = Intl.DateTimeFormat().resolvedOptions().timeZone

export interface MarkdownMessagesProps extends React.HTMLAttributes<HTMLDivElement> {
  email: string
  messages: ChitterMessage[]
  gravatarOptions?: gravatar.Options
}
// eslint-disable-next-line react/display-name
export const MarkdownMessages = forwardRef<{ scrollToBottom: () => void }, MarkdownMessagesProps>(
  ({ email, messages, gravatarOptions = {}, ...props }, ref) => {
    const classes = useStyles()
    const theme = useTheme()

    const atBottom = useRef(true)
    const listRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = useCallback(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight
      }
    }, [])

    useEffect(() => {
      const scrollListener = () => {
        if (listRef.current) {
          const distanceFromBottom =
            listRef.current.scrollHeight - listRef.current.offsetHeight - listRef.current?.scrollTop
          atBottom.current = distanceFromBottom < 8
        }
      }
      listRef.current?.addEventListener("scroll", scrollListener)
      return () => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        listRef.current?.removeEventListener("scroll", scrollListener)
      }
    }, [])

    useEffect(() => {
      atBottom.current && scrollToBottom()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages])

    // Pin the window to the bottom across any event that might change the window size
    useMutationObserver(listRef, () => atBottom.current && scrollToBottom())

    useImperativeHandle(ref, () => ({
      scrollToBottom,
    }))

    const now = new Date()
    return (
      <div ref={listRef} className={classes.messages} {...props}>
        {messages.map((message, i) => {
          const source = String.check(message.contents)
          const mine = message.email === email

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
            <div key={i} className={classes.message} style={{ flexDirection: mine ? "row-reverse" : "row" }}>
              <Avatar
                src={gravatar.url(message.email as string, gravatarOptions)}
                style={{ marginLeft: mine ? 8 : 4, marginRight: 12 }}
              />
              <div style={{ flex: 1, textAlign: mine ? "right" : "left" }}>
                {component}
                <Typography
                  component="p"
                  variant="caption"
                  style={{ fontSize: "0.8em", marginTop: -8, color: theme.palette.text.disabled }}
                >
                  {message.name} @ {timestring}
                </Typography>
              </div>
            </div>
          )
        })}
      </div>
    )
  }
)
MarkdownMessages.propTypes = {
  email: PropTypes.string.isRequired,
  messages: PropTypes.array.isRequired,
  gravatarOptions: PropTypes.any,
}
