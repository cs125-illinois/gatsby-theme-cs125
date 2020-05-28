import { GatsbyNode, CreateWebpackConfigArgs } from "gatsby"
import TSConfigPathsWebpackPlugin from "tsconfig-paths-webpack-plugin"

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = async ({
  actions,
}: CreateWebpackConfigArgs) => {
  actions.setWebpackConfig({
    resolve: {
      plugins: [new TSConfigPathsWebpackPlugin()],
    },
  })
}
