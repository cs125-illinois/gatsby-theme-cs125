export const plugins = [
  "gatsby-plugin-typescript",
  "gatsby-plugin-material-ui",
  {
    resolve: "gatsby-plugin-google-fonts",
    options: {
      fonts: [
        "Open Sans:300,300i,400,400i,500,500i,700,700i",
        "Overpass:400,500,700,900",
        "Source Code Pro:400,500,700",
      ],
      display: "swap",
    },
  },
  {
    resolve: "gatsby-source-filesystem",
    options: {
      name: "pages",
      path: "src/pages",
    },
  },
  "gatsby-plugin-mdx",
  {
    resolve: "gatsby-plugin-manifest",
    options: {
      name: process.env.npm_package_name,
      short_name: process.env.npm_package_name,
      icon: require.resolve("./src/images/favicon.png"),
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
]
