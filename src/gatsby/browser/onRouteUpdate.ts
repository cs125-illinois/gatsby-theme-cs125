import { GatsbyBrowser, RouteUpdateArgs } from "gatsby"

export const onRouteUpdate: GatsbyBrowser["onRouteUpdate"] = async ({ location }: RouteUpdateArgs) => {
  if (!location) {
    return true
  }
  try {
    const savedPosition = JSON.parse(sessionStorage.getItem("savedPosition") as string) as {
      pathname: string
      position: number
    }
    if (savedPosition.pathname === location.pathname) {
      window.scrollTo({ top: savedPosition.position })
      return true
    }
  } catch (err) {}
  try {
    if (location.hash) {
      const item = (document.querySelector(`${location.hash}`) as HTMLElement)?.offsetTop
      window.scrollTo({ top: item })
      return true
    }
  } catch (err) {}

  return true
}
