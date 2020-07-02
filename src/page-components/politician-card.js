import React from "react"
import { Link } from "gatsby"
import Img from "gatsby-image"

import style from "../style/components/politician-card.module.scss"

const politicianName = politician => {
  let name = politician.first_name
  if (politician.prefers_middle_name_shown) {
    name += " " + politician.middle_name
  }
  name += " " + politician.last_name
  name += " (" + politician.political_party.symbol + ")"
  return name;
};


const politicianRole = (politician, politicalEntities) => {
  let role = ""
  let highest_importance = 0

  politician.political_memberships.forEach(membership => {
    let political_entity = politicalEntities.find(entity => {
      return entity.strapiId === membership.political_entity
    })

    let membership_description = political_entity.political_membership_types.find(membership_type => {
      return membership_type.id === membership.political_membership_type
    })

    if (membership_description.importance > highest_importance) {
      role = membership_description.name

      if (political_entity.type !== "cabinet") {
        role += " i " + political_entity.name
      }

      highest_importance = membership_description.importance;
    }
  });



  return role
};

const PoliticianCard = ({ politician, politicalEntities }) => (
  <div className={style.politicianCard} style={{
    borderColor: politician.political_party.color
  }}>
    <Link to={"/politiker/" + politician.slug}>
      <Img
        fixed={politician.photo.childImageSharp.fixed}
        alt={"Billede af " + politicianName(politician)}
        style={{
          margin: "0 auto 18px auto",
          display: "block"
        }}
        imgStyle={{
          borderRadius: "100px"
        }} />

      <h2>{ politicianName(politician) }</h2>
      <p className={style.role}>{ politicianRole(politician, politicalEntities) }</p>
    </Link>
  </div>
)

export default PoliticianCard
