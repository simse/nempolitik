import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import moment from "moment"
import 'moment/locale/da'

export default function PoliticianRole({politicianId, entityFilter}) {
  const { allPoliticalEntities, allPoliticalEntityMembershipTypes, allPoliticalEntityMemberships } = useStaticQuery(
    graphql`
      query {
        allPoliticalEntities: allMarkdown(
          filter: { type: { eq: "political_entity" } }
        ) {
          nodes {
            name
            id
            entity_type
            logo {
              childImageSharp {
                fixed(width: 80, quality: 100) {
                  ...GatsbyImageSharpFixed_withWebp
                }
              }
            }
          }
        }
        allPoliticalEntityMembershipTypes: allMarkdown(
          filter: { type: { eq: "political_entity_membership_type" } }
        ) {
          nodes {
            name
            importance
            political_entities
            id
          }
        }
        allPoliticalEntityMemberships: allMarkdown(
          filter: { type: { eq: "political_membership" } }
        ) {
          nodes {
            from
            to
            political_entity
            political_entity_membership_type
            politician
          }
        }
      }
    `
  )

  let politicalEntities = allPoliticalEntities.nodes
  let politicalEntityMembershipTypes = allPoliticalEntityMembershipTypes.nodes
  let politicalEntityMemberships = allPoliticalEntityMemberships.nodes

  let role = ""
  let highest_importance = 0
  let past = false

  politicalEntityMemberships.forEach(membership => {
    // Ignore membership if wrong politician
    if (politicianId !== membership.politician) return

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
      if (political_entity.entity_type !== "cabinet" && political_entity.entity_type !== "parliament") {
        role += " i " + political_entity.name
      }

      highest_importance = membership_description.importance
    }
  })

    return (
      <>{role}</>
    )
}
