const politiciansQuery = `{
    politicians: allPolitician {
        nodes {
          name
          id
          slug
          photo {
            childImageSharp {
              resize(width: 80, height: 80, cropFocus: NORTH) {
                src
              }
            }
          }
          memberships {
            political_entity_membership_type {
              importance
              name
            }
            political_entity {
              name
              type
            }
          }
        }
      }
  }`

const handlePoliticiansResult = (politicians) => {
    let transformed_politicians = []

    politicians.nodes.forEach(politician => {
        p = {
            name: politician.name,
            id: politician.id,
            slug: politician.slug,
            photo: politician.photo.childImageSharp.resize.src
        }

        // Determine role
        politician.memberships.sort((a, b) => {
            if(a.political_entity_membership_type.importance > b.political_entity_membership_type.importance) {
                return -1
            } else if (a.political_entity_membership_type.importance < b.political_entity_membership_type.importance) {
                return 1
            } else {
                return 0
            }
        })

        let membership = politician.memberships[0]
        p.role = membership.political_entity_membership_type.name
        p.importance = membership.political_entity_membership_type.importance

        if (membership.political_entity.type === "municipality" || membership.political_entity.type === "region") {
            p.role += " i " + membership.political_entity.name
        }

        transformed_politicians.push(p)
    })

    return transformed_politicians
}

const queries = [
  {
    query: politiciansQuery,
    transformer: ({ data }) => handlePoliticiansResult(data.politicians),
    indexName: `Politicians`,
  }
]
module.exports = queries
