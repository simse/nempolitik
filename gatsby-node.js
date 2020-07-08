/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// Third-party dependencies
const slugify = require('slugify')
const matter = require('gray-matter')
const path = require(`path`)

//let parties = {}
//let politicians = []


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

    if (data.banner) {
      data.banner = path.relative(
        path.dirname(node.absolutePath),
        path.join(__dirname, data.banner)
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

      /*// Add foreign key relationship
      let partyId = data.party
      data.party = null
      data.party___NODE = partyId*/
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

    // console.log(parties.length)
  }
}

// Establish graphql relationships
exports.createSchemaCustomization = ({ actions, schema }) => {
  const { createTypes } = actions
  createTypes(`
    type politician implements Node {
      id: ID!
      party: politicalParty @link(from: "party" by: "id")
      memberships: [politicalMembership] @link(from: "id" by: "politician")
    }
    
    type politicalMembership implements Node {
      id: ID!
      political_entity: politicalEntity @link(from: "political_entity" by: "id")
      political_entity_membership_type: politicalEntityMembershipType @link(from: "political_entity_membership_type" by: "id")
      
    }

    type politicalEntity implements Node {
      id: ID!
      groups: [politicalEntityGroup] @link(from: "id" by: "political_entities")
    }

    type politicalEntityGroup implements Node {
      id: ID!
      political_entity: politicalEntity @link(from: "political_entities" by: "id")
      politicians: [politician] @link(from: "politicians" by: "id")
    }
    `)


  const typeDefs = [
    "type politician implements Node",
    schema.buildObjectType({
      name: "politician",
      fields: {
        group_memberships: {
          type: "[politicalEntityGroup]",
          resolve: (source, args, context, info) => {
            return context.nodeModel
              .getAllNodes({ type: "politicalEntityGroup" })
              .filter(group => group.politicians.includes(source.id))
          },
        },
      },
    }),
  ]
  createTypes(typeDefs)
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
          id
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
        perPage: politiciansPerPage,
        numPages: numPages,
        numPoliticians: politicians.data.allPoliticians.nodes.length,
        skip: i * politiciansPerPage,
        limit: politiciansPerPage
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
          type
          groups {
            slug
            id
          }
        }
      }
    }
  `)


  entities.data.allPoliticalEntity.nodes.forEach(entity => {
    if (entity.type === "municipality") {
      createPage({
        path: "/" + entity.urlPrefix + entity.slug,
        component: path.resolve("./src/templates/municipality.js"),
        context: {
          id: entity.id
        }
      })
    }

    // Create entity groups
    if (entity.groups) {
      entity.groups.forEach(group => {
        let url = entity.urlPrefix + entity.slug + "/udvalg/" + group.slug
    
    
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
  })
}
