import { FlatSource, Task, TaskArguments, JeedContext, Request, Response } from "@cs125/jeed"

export interface JeedJob {
  id: string
  sources: FlatSource[]
  tasks: Task[]
  args?: TaskArguments
  checkForSnippet?: boolean
}

export type CreateJob = (
  contents: string,
  options: {
    mode: string
    id: string
    snippet: boolean
    noCheckstyle: boolean
    useContainer: boolean
    checkForSnippet: boolean
  }
) => JeedJob

export const createJeedJob: CreateJob = (contents, options) => {
  const { mode, id, snippet, noCheckstyle, useContainer, checkForSnippet } = options
  const tasks: Record<string, boolean> = {}
  if (mode === "java") {
    tasks["compile"] = true
    if (!noCheckstyle) {
      tasks["checkstyle"] = true
    }
    tasks["complexity"] = true
  } else if (mode == "kotlin") {
    tasks["kompile"] = true
  }
  if (!useContainer) {
    tasks["execute"] = true
  } else {
    tasks["cexecute"] = true
  }
  return {
    id: id || "jeed",
    sources: [{ path: snippet ? "" : mode == "java" ? "Main.java" : "Main.kt", contents }],
    tasks: Object.keys(tasks) as Task[],
    checkForSnippet,
  }
}

export const runJeedJob = (job: JeedJob, jeed: JeedContext): Promise<Response> => {
  const { id, sources, tasks, args, checkForSnippet } = job

  const usedArgs = Object.assign({}, args, { snippet: { indent: 2 }, checkstyle: { failOnError: true } })
  const snippet = sources.length === 1 && sources[0].path === ""
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const request = { label: id, tasks, arguments: usedArgs, checkForSnippet } as Request
  if (snippet) {
    request.snippet = sources[0].contents
  } else {
    request.sources = sources
  }
  console.debug(request)
  return jeed.run(request, true)
}

export interface AceAnnotation {
  row: number
  column: number
  type: string
  text: string
}

export const getComplexityAnnotations = (response: Response): AceAnnotation[] =>
  response.completed.complexity
    ? response.completed.complexity.results[0].methods
        .filter(m => m.name !== "")
        .map(m => {
          return {
            row: m.range.start.line - 1,
            column: 0,
            type: "info",
            text: `${m.name}: complexity ${m.complexity}`,
          }
        })
    : []
