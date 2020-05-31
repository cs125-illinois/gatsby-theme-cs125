import React from "react"

import { LoremIpsum as LI } from "lorem-ipsum"

const lorem = new LI()
export function randomParagraphs(count: number): React.ReactElement[] {
  const ps = []
  for (let i = 0; i < count; i++) {
    ps.push(<p key={i}>{lorem.generateParagraphs(1)}</p>)
  }
  return ps
}
