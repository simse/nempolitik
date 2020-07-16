const query = `
query {
  groups: allPoliticalEntity {
    nodes {
      name
      slug
      id
      urlPrefix
      groups {
        name
        slug
      }
    }
  }
  politicians: allPolitician {
    nodes {
      name
      id
      slug
      photo {
        childCloudinaryAsset {
          fixed(width: 100) {
            width
            srcSet
            src
            presentationWidth
            presentationHeight
            height
            base64
          }
        }
      }
      party {
        name
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
  municipalities: allPoliticalEntity(filter: {type: {eq: "municipality"}}) {
    nodes {
      name
      slug
      id
      urlPrefix
    }
  }
  regions: allPoliticalEntity(filter: {type: {eq: "region"}}) {
    nodes {
      name
      slug
      id
      urlPrefix
    }
  }
  parties: allPoliticalParty {
    nodes {
      name
      color
      slug
      monochrome_logo {
        childCloudinaryAsset {
          fixed(width: 50) {
            width
            srcSet
            src
            presentationWidth
            presentationHeight
            height
            base64
          }
        }
      }
    }
  }
}`

const handleData = (data) => {
  let records = []

  data.politicians.nodes.forEach(politician => {
    p = {
        name: politician.name,
        id: politician.id,
        url: "/politiker/" + politician.slug,
        photo: politician.photo.childCloudinaryAsset.fixed,
        party: politician.party.name,
        type: "politician"
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

    records.push(p)
  })

  data.regions.nodes.forEach(entity => (
    records.push({
      name: entity.name,
      id: entity.id,
      url: "/" + entity.urlPrefix + entity.slug,
      type: "region",
      importance: 19
    })
  ))

  data.municipalities.nodes.forEach(entity => (
    records.push({
      name: entity.name,
      id: entity.id,
      url: "/" + entity.urlPrefix + entity.slug,
      type: "municipality",
      importance: 18
    })
  ))

  data.parties.nodes.forEach(party => (
    records.push({
      name: party.name,
      color: party.color,
      logo: party.monochrome_logo.childCloudinaryAsset.fixed,
      type: "party",
      importance: 16,
      url: "/parti/" + party.slug
    })
  ))

  data.groups.nodes.forEach(entity => {
    let urlRoot = "/" + entity.urlPrefix + entity.slug

    if (entity.groups === null) return
    
    entity.groups.forEach(group => {
      records.push({
        name: group.name,
        url: urlRoot + "/udvalg/" + group.slug,
        type: "group",
        importance: 14,
        entity: entity.name
      })
    })
  })

  return records
}

const queries = [
  {
    query: query,
    transformer: ({ data }) => handleData(data),
    indexName: `Everything`,
  }
]
module.exports = queries
