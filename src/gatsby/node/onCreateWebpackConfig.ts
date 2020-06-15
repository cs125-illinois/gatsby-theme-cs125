import { IgnorePlugin } from "webpack"
import { GatsbyNode, CreateWebpackConfigArgs } from "gatsby"

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = async ({
  stage,
  getConfig,
  actions,
}: CreateWebpackConfigArgs) => {
  const config = getConfig()
  const ourExternals = [/jsdom/, /cheerio/, /parse-unit/]
  const plugins = []
  if (stage === "build-javascript") {
    plugins.push(new IgnorePlugin({ resourceRegExp: /mode-*/, contextRegExp: /ace-builds/ }))
    plugins.push(new IgnorePlugin({ resourceRegExp: /theme-*/, contextRegExp: /ace-builds/ }))
  }
  const externals = config.externals ? [...ourExternals, ...config.externals] : ourExternals
  actions.setWebpackConfig({ externals, plugins })
}
