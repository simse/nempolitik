import moment from "moment"

// Formats politician name taking middle name preference into account
export const politicianName = politician => {
  let name = politician.first_name
  if (politician.prefers_middle_name_shown) {
    name += " " + politician.middle_name
  }
  name += " " + politician.last_name
  return name
}

// Finds most important politician role (prime minister takes precedence over being a member of parliament)
export const politicianRole = (politician, politicalEntities, entityFilter = null) => {
  let role = ""
  let highest_importance = 0
  let past = false

  politician.political_memberships.forEach(membership => {
    // Ignore membership if entityFilter is set
    if (entityFilter) {
      if (membership.political_entity !== entityFilter) return
    }

    let political_entity = politicalEntities.find(entity => {
      return entity.strapiId === membership.political_entity
    })

    let membership_description = political_entity.political_membership_types.find(
      membership_type => {
        return membership_type.id === membership.political_membership_type
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

  return role
}


export const getPoliticianExperienceOfType = (politician, type) => {
    let experiences = []

    if (!politician.experiences) {
        return experiences
    }

    politician.experiences.forEach(experience => {
        if (experience.type === type) {
            experiences.push(experience)
        }
    })

    return experiences.reverse()
}