import React, { useEffect } from "react"

import { debounce } from "throttle-debounce"
import { useLocation } from "@reach/router"

export const SavePosition: React.FC = () => {
  const location = useLocation()

  useEffect(() => {
    const savePosition = debounce(100, () => {
      sessionStorage.setItem("savedPosition", JSON.stringify({ pathname: location.pathname, position: window.scrollY }))
    })
    savePosition()

    window.addEventListener("scroll", savePosition)
    window.addEventListener("resize", savePosition)

    const mutationObserver = new MutationObserver(() => savePosition)
    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return (): void => {
      window.removeEventListener("scroll", savePosition)
      window.removeEventListener("resize", savePosition)

      mutationObserver.disconnect()
    }
  }, [location])

  return null
}
