import React from "react"
import { Link } from "gatsby"
import moment from "moment"

export default function PoliticianRole({politician, entityFilter, entityGroupFilter, entityUrl}) {
  let role = ""
  let entity_name = ""
  let show_entity = true
  let highest_importance = 0
  let past = false
  let political_entity


  if (entityGroupFilter) {
    let group = politician.group_memberships.find(g => {
      return g.id === entityGroupFilter
    })

    if (group.chairman === politician.id) {
      role = "Formand for " + group.name
    } else if (group.vice_chairman === politician.id) {
      role = "Næstformand for " + group.name
    } else {
      role = "Medlem af " + group.name
    }
  } else {
    politician.memberships.forEach(membership => {
      // Ignore membership if entityFilter is set
      if (entityFilter) {
        if (membership.political_entity.id !== entityFilter) return
      }
  
      political_entity = membership.political_entity
      let membership_description = membership.political_entity_membership_type
  
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
          entity_name += " i " + political_entity.name
        } else {
          show_entity = false
        }
  
        highest_importance = membership_description.importance
      }
    })
  }

  if (entityUrl && show_entity) {
    let url = "/" + political_entity.urlPrefix + political_entity.slug

    return (
      <>{role} <Link to={url}>{ entity_name }</Link></>
    )
  }

  if (show_entity) {
    return (
      <>{role + entity_name}</>
    )
  }

  return (<>{role}</>)

  

    
}
