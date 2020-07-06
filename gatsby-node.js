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

    let data = parsedFile.data

    // console.log(data)

    
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

    let type = "entry"

    // Indicate type
    if (node.relativePath.startsWith("parties/")) {
      type = "politicalParty"
    }

    if (node.relativePath.startsWith("political_entities/")) {
      type = "politicalEntity"
    }

    if (node.relativePath.startsWith("political_entity_groups/")) {
      type = "politicalEntityGroup"
    }

    if (node.relativePath.startsWith("political_entity_membership_types/")) {
      type = "politicalEntityMembershipType"
    }

    if (node.relativePath.startsWith("political_entity_memberships/")) {
      type = "politicalMembership"
    }

    if (node.relativePath.startsWith("politicians/")) {
      type = "politician"
    }

    // Generate slug
    if (
      type === "politicalParty" ||
      type === "politicalEntity" ||
      type === "politician" 
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
  const politicalParties = await graphql(`
    query {
      allPoliticalParties: allPoliticalParty {
        nodes {
          id
          slug
        }
      }
    }
  `)

  politicalParties.data.allPoliticalParties.nodes.forEach(party => {
    createPage({
        path: "parti/" + party.slug,
        component: path.resolve("./src/templates/party.js"),
        context: {
            id: party.id
        }
    })
  })

  // Register all politician pages
  const politicians = await graphql(`
    query {
      allPoliticians: allPolitician {
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
