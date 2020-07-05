/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const { fmImagesToRelative } = require('gatsby-remark-relative-images');
const { createFilePath } = require(`gatsby-source-filesystem`)

// Third-party dependencies
const slugify = require('slugify')
const matter = require('gray-matter')
const path = require(`path`);


exports.onCreateNode = async ({ node, actions, loadNodeContent, createContentDigest }) => {
  if (node.internal.mediaType === `text/markdown`) {
    const content = await loadNodeContent(node)
    const parsedFile = matter(content)
    const id = parsedFile.data.id
    const type = "markdown"

    let data = parsedFile.data

    console.log(data)

    
    // Fix image paths
		if (data.photo) {
      data.photo = path.relative(
        path.dirname(node.absolutePath),
        path.join(__dirname, data.photo)
      )
    }

    if (data.logo) {
      data.logo = path.relative(
        path.dirname(node.absolutePath),
        path.join(__dirname, data.logo)
      )
    }

    if (data.monochrome_logo) {
      data.monochrome_logo = path.relative(
        path.dirname(node.absolutePath),
        path.join(__dirname, data.monochrome_logo)
      )
    }

    // Indicate type
    if (node.relativePath.startsWith("parties/")) {
      data.type = "political_party"
    }

    if (node.relativePath.startsWith("political_entities/")) {
      data.type = "political_entity"
    }

    if (node.relativePath.startsWith("political_entity_membership_types/")) {
      data.type = "political_entity_membership_type"
    }

    if (node.relativePath.startsWith("political_entity_memberships/")) {
      data.type = "political_membership"
    }

    if (node.relativePath.startsWith("politicians/")) {
      data.type = "politician"
    }

    // Generate slug
    if (
      data.type === "political_party" ||
      data.type === "political_entity" ||
      data.type === "politician" 
    ) {
      data.slug = slugify(data.name, {
        lower: true,
        strict: true
      })
    }
    
    

    const markdownNode = {
      ...data,
      id,
      children: [],
      parent: node.id,
      internal: {
        contentDigest: createContentDigest(parsedFile.data),
        type,
      },
    }

    // fmImagesToRelative(markdownNode);

    const { createNode, createParentChildLink } = actions

    createNode(markdownNode)
    createParentChildLink({ parent: node, child: markdownNode })
  }
}




exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  /*const politicalParties = await graphql(`
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
  })*/

  // Register all politician pages
  const politicians = await graphql(`
    query {
      allPoliticians: allMarkdown(filter: {type: {eq: "politician"}}) {
        nodes {
          slug
        }
      }
    }
  `)


  politicians.data.allPoliticians.nodes.forEach(politician => {
    createPage({
        path: "politiker/" + politician.slug,
        component: path.resolve("./src/templates/politician.js"),
        context: {
            slug: politician.slug
        }
    })
  })

  // Register all municipalities
  /*const entities = await graphql(`
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
  })*/
}
