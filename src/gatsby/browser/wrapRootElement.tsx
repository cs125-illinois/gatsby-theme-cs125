import React, { ReactNode } from "react"
import { GatsbyBrowser, WrapRootElementBrowserArgs } from "gatsby"

import { GoogleLoginProvider, WithGoogleTokens } from "@cs125/react-google-login"
import { ElementTrackerServer } from "@cs125/element-tracker"
import { MaceProvider } from "@cs125/mace"
import { JeedProvider } from "@cs125/jeed-react"

import { String } from "runtypes"
const GOOGLE_CLIENT_ID = String.check(process.env.GOOGLE_CLIENT_ID)
const ET_SERVER = process.env.ET_SERVER && String.check(process.env.ET_SERVER)
const MACE_SERVER = process.env.MACE_SERVER && String.check(process.env.MACE_SERVER)
const JEED_SERVER = process.env.JEED_SERVER && String.check(process.env.JEED_SERVER)

console.log(`GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}`)
ET_SERVER && console.log(`ET_SERVER: ${ET_SERVER}`)
MACE_SERVER && console.log(`MACE_SERVER: ${MACE_SERVER}`)
JEED_SERVER && console.log(`JEED_SERVER: ${JEED_SERVER}`)

const WrapWithJeed: React.FC<{ children: ReactNode }> = ({ children }) => {
  if (JEED_SERVER) {
    return <JeedProvider server={JEED_SERVER}>{children}</JeedProvider>
  } else {
    return <>{children}</>
  }
}

export const wrapRootElement: GatsbyBrowser["wrapRootElement"] = ({ element }: WrapRootElementBrowserArgs) => {
  return (
    <GoogleLoginProvider clientConfig={{ client_id: GOOGLE_CLIENT_ID }}>
      <WithGoogleTokens>
        {({ idToken }) => (
          <ElementTrackerServer server={ET_SERVER} googleToken={idToken}>
            <MaceProvider server={MACE_SERVER} googleToken={idToken}>
              <WrapWithJeed>{element}</WrapWithJeed>
            </MaceProvider>
          </ElementTrackerServer>
        )}
      </WithGoogleTokens>
    </GoogleLoginProvider>
  )
}
