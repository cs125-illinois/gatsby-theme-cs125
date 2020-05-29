import React from "react"
import PropTypes from "prop-types"

import { GoogleLoginProvider, WithGoogleTokens } from "@cs125/react-google-login"
import { ElementTracker } from "@cs125/element-tracker"

import { String } from "runtypes"
const GOOGLE_CLIENT_ID = String.check(process.env.GOOGLE_CLIENT_ID)
const ET_SERVER = String.check(process.env.ET_SERVER)

const Root = ({ element }) => {
  return (
    <GoogleLoginProvider clientConfig={{ client_id: GOOGLE_CLIENT_ID }}>
      <WithGoogleTokens>
        {({ idToken }) => (
          <ElementTracker server={ET_SERVER} tags={["h1", "h2", "h3"]} googleToken={idToken}>
            {element}
          </ElementTracker>
        )}
      </WithGoogleTokens>
    </GoogleLoginProvider>
  )
}
Root.propTypes = {
  element: PropTypes.node.isRequired,
}
export { Root as wrapRootElement }

export const onRouteUpdate = ({ location }) => scrollToAnchor(location)
function scrollToAnchor(location, mainNavHeight = 0) {
  // Check for location so build does not fail
  if (location && location.hash) {
    const item = document.querySelector(`${location.hash}`).offsetTop

    window.scrollTo({
      top: item - mainNavHeight,
    })
  }

  return true
}
