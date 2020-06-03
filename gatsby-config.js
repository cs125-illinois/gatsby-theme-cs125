require("source-map-support").install()
require("ts-node").register()
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` })

module.exports = require("./gatsby-config.ts")
