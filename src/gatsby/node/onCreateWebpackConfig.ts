import { GatsbyNode, CreateWebpackConfigArgs } from "gatsby"

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = async ({
  getConfig,
  actions,
}: CreateWebpackConfigArgs) => {
  const config = getConfig()
  const ourExternals = {
    jsdom: "jsdom",
    cheerio: "cheerio",
  }
  const externals = config.externals ? [ourExternals, ...config.externals] : ourExternals
  actions.setWebpackConfig({ externals })
}
