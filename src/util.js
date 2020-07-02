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
export const politicianRole = (politician, politicalEntities) => {
  let role = ""
  let highest_importance = 0

  politician.political_memberships.forEach(membership => {
    let political_entity = politicalEntities.find(entity => {
      return entity.strapiId === membership.political_entity
    })

    let membership_description = political_entity.political_membership_types.find(
      membership_type => {
        return membership_type.id === membership.political_membership_type
      }
    )

    if (membership_description.importance > highest_importance) {
      role = membership_description.name

      if (political_entity.type !== "cabinet") {
        role += " i " + political_entity.name
      }

      highest_importance = membership_description.importance
    }
  })

  return role
}
