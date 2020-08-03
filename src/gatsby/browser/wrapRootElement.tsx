import React from "react"
import { GatsbyBrowser, WrapRootElementBrowserArgs } from "gatsby"

import { GoogleLoginProvider, WithGoogleTokens } from "@cs125/react-google-login"
import { PersonableProvider } from "../../personable/"
import { ElementTrackerServer } from "@cs125/element-tracker"
import { MaceProvider } from "@cs125/mace"
import { JeedProvider } from "@cs125/jeed"
import { ChitterProvider } from "@cs125/chitter"
import { ThemeProvider } from "../../material-ui"
import CssBaseline from "@material-ui/core/CssBaseline"

import { String } from "runtypes"
const GOOGLE_CLIENT_ID = String.check(process.env.GOOGLE_CLIENT_IDS).split(",")[0]
const PERSONABLE_SERVER = String.check(process.env.PERSONABLE_SERVER)
const ET_SERVER = process.env.ET_SERVER && String.check(process.env.ET_SERVER)
const MACE_SERVER = process.env.MACE_SERVER && String.check(process.env.MACE_SERVER)
const JEED_SERVER = process.env.JEED_SERVER && String.check(process.env.JEED_SERVER)
const CHITTER_SERVER = process.env.CHITTER_SERVER && String.check(process.env.CHITTER_SERVER)

console.log(`GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}`)
console.log(`PERSONABLE_SERVER: ${PERSONABLE_SERVER}`)
ET_SERVER && console.log(`ET_SERVER: ${ET_SERVER}`)
MACE_SERVER && console.log(`MACE_SERVER: ${MACE_SERVER}`)
JEED_SERVER && console.log(`JEED_SERVER: ${JEED_SERVER}`)
CHITTER_SERVER && console.log(`CHITTER_SERVER: ${CHITTER_SERVER}`)

interface WithGoogleToken {
  idToken: string | undefined
}
// eslint-disable-next-line react/prop-types
const WrapWithJeed: React.FC<WithGoogleToken> = ({ idToken, children }) =>
  JEED_SERVER ? (
    <JeedProvider googleToken={idToken} server={JEED_SERVER}>
      {children}
    </JeedProvider>
  ) : (
    <>{children}</>
  )
// eslint-disable-next-line react/prop-types
const WrapWithChitter: React.FC<WithGoogleToken> = ({ idToken, children }) =>
  CHITTER_SERVER ? (
    <ChitterProvider googleToken={idToken} server={CHITTER_SERVER}>
      {children}
    </ChitterProvider>
  ) : (
    <>{children}</>
  )

export const wrapRootElement: GatsbyBrowser["wrapRootElement"] = ({ element }: WrapRootElementBrowserArgs) => {
  return (
    <GoogleLoginProvider clientConfig={{ client_id: GOOGLE_CLIENT_ID }}>
      <PersonableProvider server={PERSONABLE_SERVER}>
        <WithGoogleTokens>
          {({ idToken }) => (
            <ElementTrackerServer server={ET_SERVER} googleToken={idToken}>
              <MaceProvider server={MACE_SERVER} googleToken={idToken}>
                <WrapWithJeed idToken={idToken}>
                  <WrapWithChitter idToken={idToken}>
                    <ThemeProvider>
                      <CssBaseline />
                      {element}
                    </ThemeProvider>
                  </WrapWithChitter>
                </WrapWithJeed>
              </MaceProvider>
            </ElementTrackerServer>
          )}
        </WithGoogleTokens>
      </PersonableProvider>
    </GoogleLoginProvider>
  )
}
