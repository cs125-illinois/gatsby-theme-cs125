import React from "react"

import { LoremIpsum as LI } from "lorem-ipsum"
import { P } from "../material-ui/Typography"

const lorem = new LI()
export function randomParagraphs(count: number): React.ReactElement[] {
  const ps = []
  for (let i = 0; i < count; i++) {
    ps.push(<P key={i}>{lorem.generateParagraphs(1)}</P>)
  }
  return ps
}
