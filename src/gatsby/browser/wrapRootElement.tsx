import React from "react"
import { GatsbyBrowser, WrapRootElementBrowserArgs } from "gatsby"

import { GoogleLoginProvider, WithGoogleTokens } from "@cs125/react-google-login"
import { ElementTrackerServer } from "@cs125/element-tracker"
import { ThemeProvider } from "../../material-ui"
import { CssBaseline } from "@material-ui/core"

import { String } from "runtypes"
const GOOGLE_CLIENT_ID = String.check(process.env.GOOGLE_CLIENT_ID)
const ET_SERVER = process.env.ET_SERVER && String.check(process.env.ET_SERVER)

console.log(`GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}`)
ET_SERVER && console.log(`ET_SERVER: ${ET_SERVER}`)

export const wrapRootElement: GatsbyBrowser["wrapRootElement"] = ({ element }: WrapRootElementBrowserArgs) => {
  return (
    <GoogleLoginProvider clientConfig={{ client_id: GOOGLE_CLIENT_ID }}>
      <WithGoogleTokens>
        {({ idToken }) => (
          <ElementTrackerServer server={ET_SERVER} googleToken={idToken}>
            <ThemeProvider>
              <CssBaseline />
              {element}
            </ThemeProvider>
          </ElementTrackerServer>
        )}
      </WithGoogleTokens>
    </GoogleLoginProvider>
  )
}
