import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import moment from "moment"
import 'moment/locale/da'

export default function PoliticianRole({politicianId, entityFilter, entityGroupFilter}) {
  const { allPoliticalEntities, allPoliticalEntityMembershipTypes, allPoliticalEntityMemberships, allPoliticalEntityGroups } = useStaticQuery(
    graphql`
      query {
        allPoliticalEntities: allPoliticalEntity {
          nodes {
            name
            id
            type
            logo {
              childImageSharp {
                fixed(width: 80, quality: 100) {
                  ...GatsbyImageSharpFixed_withWebp
                }
              }
            }
          }
        }
        allPoliticalEntityMembershipTypes: allPoliticalEntityMembershipType {
          nodes {
            name
            importance
            political_entities
            id
          }
        }
        allPoliticalEntityMemberships: allPoliticalMembership {
          nodes {
            from
            to
            political_entity
            political_entity_membership_type
            politician
          }
        }
        allPoliticalEntityGroups: allPoliticalEntityGroup {
          nodes {
            id
            name
            chairman
            vice_chairman
          }
        }
      }
    `
  )

  let politicalEntities = allPoliticalEntities.nodes
  let politicalEntityMembershipTypes = allPoliticalEntityMembershipTypes.nodes
  let politicalEntityMemberships = allPoliticalEntityMemberships.nodes
  let politicalEntityGroups = allPoliticalEntityGroups.nodes

  let role = ""
  let highest_importance = 0
  let past = false


  if (entityGroupFilter) {
    let group = politicalEntityGroups.find(g => {
      return g.id === entityGroupFilter
    })

    if (group.chairman === politicianId) {
      role = "Formand for " + group.name
    } else if (group.vice_chairman === politicianId) {
      role = "Næstformand for " + group.name
    } else {
      role = "Medlem af " + group.name
    }
  } else {
    politicalEntityMemberships.forEach(membership => {
      // Ignore membership if wrong politician
      if (politicianId !== membership.politician) return
  
      //console.log(entityFilter)
  
      // Ignore membership if entityFilter is set
      if (entityFilter) {
        if (membership.political_entity !== entityFilter) return
      }
  
      let political_entity = politicalEntities.find(entity => {
        return entity.id === membership.political_entity
      })
  
      let membership_description = politicalEntityMembershipTypes.find(
        membership_type => {
          return membership_type.id === membership.political_entity_membership_type
        }
      )
  
      // Check if membership has ended
      if (membership.to) {
        let date = moment(membership.to)
        let currentDate = moment.now()
  
        if (date < currentDate) {
          past = true
          membership_description.importance = 1
        }
      }
  
      // Find political membership with highest importance
      if (membership_description.importance > highest_importance) {
        // If political membership is in the past, show it if nothing is more relevant
        if (past) {
          role = "Tidligere " + membership_description.name.charAt(0).toLowerCase() + membership_description.name.slice(1)
        } else {
          role = membership_description.name
        }
  
        
        // Cabinet and parliament positions are self-explanatory since there is only one relevant of each
        if (political_entity.type !== "cabinet" && political_entity.type !== "parliament") {
          role += " i " + political_entity.name
        }
  
        highest_importance = membership_description.importance
      }
    })
  }


  

    return (
      <>{role}</>
    )
}
