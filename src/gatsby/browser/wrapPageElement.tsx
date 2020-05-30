import React from "react"
import { GatsbyBrowser, WrapPageElementBrowserArgs } from "gatsby"
import { SavePosition } from "../SavePosition"

export const wrapPageElement: GatsbyBrowser["wrapPageElement"] = ({ element }: WrapPageElementBrowserArgs) => {
  return (
    <>
      <SavePosition />
      {element}
    </>
  )
}
