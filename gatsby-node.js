/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 *//*
const path = require(`path`)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  const politicalParties = await graphql(`
    query {
      allStrapiPoliticalParties {
        nodes {
          slug
        }
      }
    }
  `)

  politicalParties.data.allStrapiPoliticalParties.nodes.forEach(party => {
    createPage({
        path: "parti/" + party.slug,
        component: path.resolve("./src/templates/party.js"),
        context: {
            slug: party.slug
        }
    })
  })

  // Register all politician pages
  const politicians = await graphql(`
    query {
      allStrapiPolitician {
        nodes {
          slug
        }
      }
    }
  `)

  politicians.data.allStrapiPolitician.nodes.forEach(politician => {
    createPage({
        path: "politiker/" + politician.slug,
        component: path.resolve("./src/templates/politician.js"),
        context: {
            slug: politician.slug
        }
    })
  })

  // Register all municipalities
  const entities = await graphql(`
    query {
      allStrapiPoliticalEntities {
        nodes {
          slug
          type
        }
      }
    }
  `)

  entities.data.allStrapiPoliticalEntities.nodes.forEach(entity => {
    if (entity.type === "municipality") {
      createPage({
        path: "kommune/" + entity.slug,
        component: path.resolve("./src/templates/municipality.js"),
        context: {
            slug: entity.slug
        }
    })
    }
  })
}*/
