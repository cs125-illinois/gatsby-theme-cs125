import React, { useRef } from "react"
import PropTypes from "prop-types"

const SSR = typeof window === "undefined"

/* eslint-disable no-var,@typescript-eslint/no-var-requires */
if (SSR) {
  var JSDOM = require("jsdom").JSDOM
  const jsdom = new JSDOM("<!doctype html><html><body></body></html>")
  global.window = jsdom.window

  var ace = require("ace-builds/src-noconflict/ace")
  var parseUnit = require("parse-unit")
  var cheerio = require("cheerio")

  delete global.window
}
import css from "./AceSSR.css"

const ssrPostfix = "___ssr"
export const hasAceSSR = (id: string): boolean =>
  typeof window !== "undefined" && document.getElementById(`${id}${ssrPostfix}`) !== undefined

/* eslint-enable no-var,@typescript-eslint/no-var-requires */

export interface AceSSRProps {
  id: string
  gutterWidth: string
  lineHeight: string | number
  extraLines?: number
  theme?: string
  mode?: string | Record<string, unknown>
  value?: string
  defaultValue?: string
  fontSize?: number | string
  width?: string
  height?: string
  maxLines?: number
  style?: CSSStyleSheet
  className?: string
  numbers: boolean
}
export const AceSSR: React.FC<AceSSRProps> = ({
  id,
  theme,
  mode,
  value,
  defaultValue,
  maxLines,
  extraLines,
  style,
  width,
  fontSize,
  className = "",
  numbers,
  ...props
}) => {
  const ssrID = `${id}___ssr`

  const lineHeight = typeof props.lineHeight === "number" ? `${props.lineHeight}px` : props.lineHeight

  if (SSR) {
    const [lineHeightNumber, lineHeightUnit] = parseUnit(lineHeight)

    const jsdom = new JSDOM("<!doctype html><html><body></body></html>")
    const { window } = jsdom
    const { document } = window
    global.window = window
    global.document = document

    /*
     * The exact values for these width and height properties don't matter, since we'll patch them later.
     * They just need to be non-zero or Ace will refuse to render our content.
     */
    Object.defineProperties(window.HTMLElement.prototype, {
      clientWidth: {
        get: function () {
          return 512
        },
      },
      offsetWidth: {
        get: function () {
          return 512
        },
      },
      clientHeight: {
        get: function () {
          return 100
        },
      },
    })
    window.HTMLElement.prototype.getBoundingClientRect = function () {
      return { width: 256 }
    }

    const aceContainer = document.createElement("div")
    aceContainer.setAttribute("id", id)
    document.body.appendChild(aceContainer)

    const editor = ace.edit(id)
    if (mode !== "") {
      require(`ace-builds/src-noconflict/mode-${mode}`)
      editor.getSession().setMode(`ace/mode/${mode}`)
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const themeCSS = theme !== "" ? require(`ace-builds/src-noconflict/theme-${theme}`).cssText : undefined
    themeCSS && editor.setTheme(`ace/theme/${theme}`)
    editor.setFontSize(fontSize)
    editor.setOption("maxLines", Infinity)
    const initialValue = (!defaultValue ? value : defaultValue) || ""
    editor.getSession().setValue(initialValue)
    editor.setOption("showLineNumbers", numbers)
    editor.resize(true)

    const editorElement = document.getElementById(id)
    window.close()
    // eslint-disable-next-line no-native-reassign
    delete global.window
    delete global.document

    const $ = cheerio.load(editorElement.outerHTML)
    $("div").each(function (_: number, elem: CheerioElement) {
      if ($(elem).css("visibility") === "hidden") {
        $(elem).remove()
        return
      }
      $(elem).css("transform", "")
      if ($(elem).css("height") === "1000000px") {
        $(elem).css("height", "")
      }
    })
    $("span").each(function (_: number, elem: CheerioElement) {
      if ($(elem).css("display") === "none") {
        $(elem).remove()
      }
    })
    $(".ace_gutter-active-line").removeClass("ace_gutter-active-line")
    $(".ace_content").css("width", "")
    $(".ace_print-margin-layer").remove()
    $(".ace_marker-layer").remove()
    $(".ace_cursor-layer").remove()
    $(".ace_scrollbar").remove()
    $(".ace_layer").css("pointer-events", "auto")
    $(".ace_scroller").css("user-select", "text")
    $(".ace_scroller").css("-ms-user-select", "text")
    $(".ace_scroller").css("-moz-user-select", "text")
    $(".ace_scroller").css("-webkit-user-select", "text")
    $(".ace_scroller").css("line-height", `${lineHeightNumber}${lineHeightUnit}`)
    $(".ace_scroller").css("left", props.gutterWidth)
    $(".ace_gutter, .ace_gutter-layer").css("width", props.gutterWidth)
    $("textarea").remove()

    $(".ace_gutter-cell, .ace_line").each(function (_: number, elem: CheerioElement) {
      const [heightNumber, heightUnit] = parseUnit($(elem).css("height"))
      const [topNumber, topUnit] = parseUnit($(elem).css("top"))
      if (heightNumber % 100 !== 0 || heightUnit !== "px" || topNumber % 100 !== 0 || topUnit !== "px") {
        throw Error("Gutter height problem")
      }
      $(elem).css("height", `${lineHeightNumber}${lineHeightUnit}`)
      const multiplier = Math.floor(topNumber / 100)
      $(elem).css("top", `${multiplier * lineHeightNumber}${lineHeightUnit}`)
    })
    $(".ace_line").each(function (_: number, elem: CheerioElement) {
      $(elem).append("<br>")
    })

    const contentHeightInLines = initialValue.split("\n").length
    const heightInLines = Math.min(contentHeightInLines, maxLines || Infinity)
    const height = props.height || `${(heightInLines + (extraLines || 0)) * lineHeightNumber}${lineHeightUnit}`
    $(".ace_content, .ace_text-layer, .ace_gutter, .ace_scroller").css(
      "height",
      `${contentHeightInLines * lineHeightNumber}${lineHeightUnit}`
    )
    $(".ace_content").each(function (_: number, elem: CheerioElement) {
      elem.tagName = "code"
    })

    return (
      <div id={ssrID}>
        <style dangerouslySetInnerHTML={{ __html: css }} />
        {themeCSS && <style dangerouslySetInnerHTML={{ __html: themeCSS }} />}
        <div
          style={{
            height,
            width,
            fontSize,
            overflow: "auto",
            ...style,
          }}
          className={`${editorElement.className.trim()} ${className}`.trim()}
          dangerouslySetInnerHTML={{ __html: $(`#${id}`).html() }}
        />
      </div>
    )
  }
  /* eslint-enable @typescript-eslint/no-var-requires */

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const serverContent = useRef<string | undefined>(!SSR && document.getElementById(ssrID)?.innerHTML)
  if (!serverContent.current) {
    return null
  }
  return <div id={ssrID} dangerouslySetInnerHTML={{ __html: serverContent.current }}></div>
}
AceSSR.propTypes = {
  id: PropTypes.string.isRequired,
  numbers: PropTypes.bool.isRequired,
  gutterWidth: PropTypes.string.isRequired,
  mode: PropTypes.string,
  theme: PropTypes.string,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  style: PropTypes.any,
  lineHeight: PropTypes.oneOfType([PropTypes.number.isRequired, PropTypes.string.isRequired]).isRequired,
  maxLines: PropTypes.number,
  extraLines: PropTypes.number,
  height: PropTypes.string,
  width: PropTypes.string,
  fontSize: PropTypes.string,
  className: PropTypes.string,
}
AceSSR.defaultProps = {
  mode: "",
  theme: "",
  value: "",
  width: "500px",
  fontSize: "12px",
  extraLines: 0,
  className: "",
}
