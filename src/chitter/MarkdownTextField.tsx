import React, { useState, useCallback, useImperativeHandle, forwardRef, useRef } from "react"
import PropTypes from "prop-types"

import gravatar from "gravatar"
import Avatar from "@material-ui/core/Avatar"
import makeStyles from "@material-ui/core/styles/makeStyles"

import useTimeout from "@rooks/use-timeout"
import useOutsideClick from "@rooks/use-outside-click"

import TextField, { TextFieldProps } from "@material-ui/core/TextField"
import LinearProgress from "@material-ui/core/LinearProgress"

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    position: "relative",
    display: "flex",
    flexDirection: "row",
    paddingRight: 8,
  },
})

export interface ChittererTextFieldProps {
  onNewMessage: (contents: string) => void
  email: string | undefined
  gravatarOptions?: gravatar.Options
}
// eslint-disable-next-line react/display-name
export const MarkdownTextField = forwardRef<{ clear: () => void }, TextFieldProps & ChittererTextFieldProps>(
  ({ onNewMessage, email, gravatarOptions, ...props }, ref) => {
    const classes = useStyles()

    const textRef = useRef<HTMLDivElement>(null)
    const clickedOutside = useRef(false)
    useOutsideClick(textRef as React.MutableRefObject<HTMLInputElement>, () => {
      clickedOutside.current = true
    })

    const [value, setValue] = useState("")
    const [disabled, setDisabled] = useState(false)
    const [spinner, setSpinner] = useState(false)
    const { start: startTimer, clear: clearTimer } = useTimeout(() => setSpinner(true), 1024)

    useImperativeHandle(ref, () => ({
      clear: () => {
        setValue("")
        setDisabled(false)
        setSpinner(false)
        clearTimer()
        clickedOutside?.current === false && textRef.current?.focus()
      },
    }))

    // We control the value of the input box, so each time it changes we need to update our copy
    const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value), [])

    // We want enter to trigger sending the message, but also want to allow Control-Enter to advance
    // to the next line
    const onKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>, contents: string, disabled: boolean) => {
        if (disabled) {
          event.preventDefault()
          return
        }
        if (event.key != "Enter") {
          return
        }

        const lines = contents.split("\n")
        const currentLine = lines.slice(-1)[0].trim()
        const empty = lines.filter(l => l.trim() !== "").length == 0
        const inCode = lines.filter(l => l.startsWith("```")).length % 2 == 1

        if (empty) {
          setValue("")
        } else if (event.ctrlKey || inCode || currentLine === "```") {
          setValue(i => i + "\n")
        } else {
          let currentlyInCode = false
          let fixedContents = ""
          for (const line of lines) {
            if (line === "```") {
              currentlyInCode = !currentlyInCode
            }
            if (fixedContents !== "") {
              if (line !== "```" && !currentlyInCode) {
                fixedContents += "  \n"
              } else {
                fixedContents += "\n"
              }
            }
            fixedContents += line
          }
          onNewMessage(fixedContents)
          setDisabled(true)
          clickedOutside.current = false
          startTimer()
        }

        event.preventDefault()
      },
      [startTimer, onNewMessage]
    )

    return (
      <div className={classes.container}>
        <div className={classes.input}>
          <Avatar src={gravatar.url(email as string, gravatarOptions)} style={{ margin: 4 }} />
          <TextField
            inputRef={textRef}
            {...props}
            disabled={disabled}
            style={{ flex: 1 }}
            value={value}
            multiline
            onChange={onChange}
            onKeyDown={e => onKeyDown(e, value, disabled)}
          />
        </div>
        {spinner && <LinearProgress style={{ marginRight: 8 }} />}
      </div>
    )
  }
)

MarkdownTextField.propTypes = {
  onNewMessage: PropTypes.func.isRequired,
  email: PropTypes.string,
  gravatarOptions: PropTypes.object,
}
