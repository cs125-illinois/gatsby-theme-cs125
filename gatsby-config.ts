import path from "path"

import { String } from "runtypes"
const title = process.env.npm_package_name && String.check(process.env.npm_package_name)
const description = process.env.npm_package_description && String.check(process.env.npm_package_description)

export const siteMetadata = { title, description }
export const plugins: unknown[] = [
  "gatsby-plugin-typescript",
  {
    resolve: "gatsby-plugin-material-ui",
    options: {
      stylesProvider: {
        injectFirst: true,
      },
    },
  },
  {
    resolve: "gatsby-plugin-prefetch-google-fonts",
    options: {
      fonts: [
        {
          family: "Open Sans",
          variants: ["300", "300i", "400", "400i", "500", "500i", "700", "700i"],
        },
        {
          family: "Overpass",
          variants: ["400", "500", "700"],
        },
        {
          family: "Source Code Pro",
          variants: ["400", "500", "700"],
        },
      ],
    },
  },
  {
    resolve: "gatsby-source-filesystem",
    options: {
      name: "pages",
      path: path.join(__dirname, "src", "pages"),
    },
  },
  {
    resolve: "gatsby-source-filesystem",
    options: {
      name: "images",
      path: path.join(__dirname, "src", "images"),
    },
  },
  "gatsby-plugin-mdx",
  {
    resolve: "gatsby-plugin-manifest",
    options: {
      name: title,
      short_name: title,
      icon: require.resolve("./src/images/logo.png"),
    },
  },
  {
    resolve: "gatsby-plugin-env-variables",
    options: {
      whitelist: ["npm_package_name", "npm_package_version", "npm_package_description"],
    },
  },
  "gatsby-plugin-react-helmet",
  "gatsby-plugin-sass",
  "gatsby-plugin-sharp",
  "gatsby-transformer-sharp",
  {
    resolve: "gatsby-plugin-graphql-codegen",
    options: {
      documentPaths: ["./src/**/*.{ts,tsx}"],
    },
  },
]
if (process.env.THEME_DEVELOPMENT) {
  plugins.push(
    {
      resolve: "gatsby-alias-imports",
      options: {
        aliases: {
          react: "./node_modules/react",
          "@cs125/element-tracker": "../element-tracker/",
          "@cs125/react-google-login": "../react-google-login",
          "@cs125/mace": "../mace",
        },
      },
    },
    "gatsby-plugin-webpack-bundle-analyser-v2"
  )
}
