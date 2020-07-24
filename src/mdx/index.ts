import { headings } from "./Headings"
import { P, A } from "../material-ui/Typography"
import { Code, Pre } from "./Code"

export const components = {
  ...headings,
  p: P,
  code: Code,
  pre: Pre,
  a: A,
}
export { headings, P, A, Code, Pre }
