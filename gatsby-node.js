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

      if (data.type === "cabinet") {
        data.urlPrefix = "regering/"
      } else if (data.type === "municipality") {
        data.urlPrefix = "kommune/"
      } else {
        data.urlPrefix = ""
      }
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
      type === "politicalEntityGroup" ||
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
          id
        }
      }
    }
  `)


  politicians.data.allPoliticians.nodes.forEach(politician => {
    createPage({
        path: "politiker/" + politician.slug,
        component: path.resolve("./src/templates/politician.js"),
        context: {
            slug: politician.slug,
            politicianId: politician.id
        }
    })
  })

  // Create all politicians page with pagination
  const politiciansPerPage = 48
  const numPages = Math.ceil(politicians.data.allPoliticians.nodes.length / politiciansPerPage)

  Array.from({ length: numPages }).forEach((_, i) => {
    createPage({
      path: i === 0 ? `/politikere` : `/politikere/side-${i + 1}`,
      component: path.resolve("./src/templates/politikere.js"),
      context: {
        currentPage: i,
        perPage: politiciansPerPage
      }
    });
  });

  // Register all political entity groups
  const entities = await graphql(`
    query {
      allPoliticalEntity {
        nodes {
          id
          slug
          urlPrefix
        }
      }
    }
  `)

  const entity_groups = await graphql(`
    query {
      allPoliticalEntityGroup {
        nodes {
          id
          name
          political_entities
        }
      }
    }
  `)

  entity_groups.data.allPoliticalEntityGroup.nodes.forEach(group => {
    let entity = entities.data.allPoliticalEntity.nodes.find(e => {
      return e.id === group.political_entities
    })

    let url = entity.urlPrefix + entity.slug + "/udvalg/" + slugify(group.name,  {
      lower: true,
      strict: true
    })


    createPage({
      path: url,
      component: path.resolve("./src/templates/entity_group.js"),
      context: {
        groupId: group.id,
        entityId: entity.id
      }
    })
  })

}
