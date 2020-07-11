const { isNil } = require('lodash')

module.exports = {
  siteMetadata: {
    title: `nempolitik.dk`,
    description: `Kick off your next, great Gatsby project with this default starter. This barebones starter ships with the main Gatsby configuration files you might need.`,
    author: `@simse`,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-build-date`,
      options: {
        formatAsDateString: true, // boolean, defaults to true - if false API will return unformatted string from new Date()
        formatting: {
          format: 'dddd D MMMM YYYY', // string, defaults to "MM/DD/YYYY" - pass in any acceptable date-and-time format
          utc: false, // boolean, defaults to false - output time as UTC or not, following date-and-time API
        },
        locale: 'dk', // string, defaults to null, which date-and-time defaults as "en" - whether to localize the date or not, can use any available date-and-time localization
      },
    },
    {
      resolve: `gatsby-plugin-netlify-cms`,
      options: {
        modulePath: `${__dirname}/src/cms/cms.js`,
      },
    },
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-sass`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/static/images`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/content`,
      },
    },
    `gatsby-transformer-sharp`,
    {
      resolve: "gatsby-plugin-sharp",
      options: {
        useMozJpeg: false,
        stripMetadata: true,
        defaultQuality: 100,
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `gatsby-starter-default`,
        short_name: `starter`,
        start_url: `/`,
        background_color: `#663399`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/images/logo_compact.png`, // This path is relative to the root of the site.
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
}
