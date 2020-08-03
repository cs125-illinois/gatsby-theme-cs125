import React, { ReactNode, createContext, useEffect, useCallback, useState, useContext } from "react"
import PropTypes from "prop-types"

import { FullResponse } from "@cs125/personable-client"
import { useGoogleTokens } from "@cs125/react-google-login"

export interface PersonableContext extends FullResponse {
  impersonate: (netID: string) => void
  impersonating: boolean
}
export interface PersonableProviderProps {
  server: string
  children: ReactNode
}
export const PersonableProvider: React.FC<PersonableProviderProps> = ({ server, children }) => {
  const { idToken } = useGoogleTokens()

  const [fullResponse, setFullResponse] = useState<FullResponse | undefined>()
  const [impersonating, setImpersonating] = useState<string | undefined>()

  const update = useCallback(async () => {
    const headers = idToken ? { "google-token": idToken } : ({} as Record<string, string>)
    if (impersonating) {
      headers["impersonate"] = impersonating
    }
    fetch(`${server}/all/CS/125`, { headers })
      .then(response => response.json())
      .then(response => {
        const full = FullResponse.check(response)
        if (impersonating && !full.you) {
          setImpersonating(undefined)
        }
        setFullResponse(full)
      })
  }, [server, idToken, impersonating])
  useEffect(() => {
    update()
  }, [update])

  const impersonate = useCallback((netID: string) => {
    setImpersonating(netID)
  }, [])

  console.log(fullResponse?.you)

  return (
    <PersonableContext.Provider
      value={
        fullResponse
          ? {
              impersonating: fullResponse.you ? fullResponse.you.email === impersonating : false,
              impersonate,
              ...fullResponse,
            }
          : undefined
      }
    >
      {children}
    </PersonableContext.Provider>
  )
}
PersonableProvider.propTypes = {
  server: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
}
export const PersonableContext = createContext<PersonableContext | undefined>(undefined)
export const usePersonable = (): PersonableContext | undefined => useContext(PersonableContext)
