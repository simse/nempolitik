import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"
import moment from "moment"
import 'moment/locale/da'

import SEO from "../components/seo"
import Layout from "../components/layout"

import style from "../style/pages/politician.module.scss"
import {
  politicianName,
  politicianRole,
  getPoliticianExperienceOfType,
} from "../util.js"
import PartyTag from "../components/party-tag"

const politicianExperience = (educations, emptyMessage) => {
  if (educations.length === 0) {
    return <p className={style.empty}>{emptyMessage}</p>
  } else {
    let list = []

    list = educations.map(experience => {
      let range = ""

      if (experience.from === experience.to) {
        range = experience.to
      } else if (!experience.to) {
        range = experience.from + " — "
      } else {
        range = experience.from + " — " + experience.to
      }

      return (
        <div className={style.entry} key={experience.title}>
          <h3>{experience.title}</h3>
          <span>{experience.place}</span>
          <p>{range}</p>
        </div>
      )
    })

    return list
  }
}

const parseBirthday = birthday => {
  var today = new Date()
  var birthDate = new Date(birthday)
  var age = today.getFullYear() - birthDate.getFullYear()
  var m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  moment.locale("da")
  let birthdayString = moment(birthday).format('LL');

  return birthdayString + ` (${age} år)`
}

const politicalGroupCards = (politician, political_entities, political_entity_groups) => {
  // Find groups this politician is member of
  if (politician.political_memberships.length === 0) {
    return (
      <div className={`${style.card} ${style.noMembership}`}>
        Denne politiker er ikke en del af nogle byråd, regionråd eller regeringer.
      </div>
    )
  }

  let cards = {}

  // Check every political membership
  politician.political_memberships.forEach(membership => {
    // Determine if political membership has ended
    if (membership.to) {
      let date = moment(membership.to)
      let currentDate = moment.now()

      if (date < currentDate) {
        return
      }
    }

    let political_entity = political_entities.find(entity => {
      return entity.strapiId === membership.political_entity
    })

    let political_membership_type = political_entity.political_membership_types.find(type => {
      return type.id === membership.political_membership_type
    })

    let role = political_membership_type.name


    if (political_entity.type !== "cabinet" && political_entity.type !== "parliament") {
      role = political_membership_type.name + " i " + political_entity.name
    }

    // check if entity has already been added
    if (political_entity.strapiId in cards) {
      cards[political_entity.strapiId].roles.push(role)
    } else {
      cards[political_entity.strapiId] = {
        name: political_entity.name,
        logo: political_entity.logo,
        roles: [role]
      }
    }
  })

  // Check every political group (child political entity)
  politician.political_entity_groups.forEach(group => {
    let political_entity = political_entities.find(entity => {
      return entity.strapiId === group.political_entity
    })

    let roles = []

    // Check if chairman
    if (politician.strapiId === group.chairman) {
      roles.push("Formand for " + group.name)
    // Check if vice chairman
    } else if (politician.strapiId === group.vice_chairman) {
      roles.push("Næstformand for " + group.name)
    } else {
      roles.push("Medlem af " + group.name)
    }

    if (political_entity.strapiId in cards) {
      cards[political_entity.strapiId].roles = cards[political_entity.strapiId].roles.concat(roles)
    } else {
      cards[political_entity.strapiId] = {
        name: political_entity.name,
        logo: political_entity.logo,
        roles: roles
      }
    }
  })

  // Generate card output
  return Object.values(cards).map(card => {
    let roles = card.roles.map(role => (
      <div className={style.role} key={role}>
        {role}
      </div>
    ))

    return (
      <div className={`${style.card} ${style.politicalGroup}`} key={card.name}>
        <div className={style.header}>
          <Img fixed={card.logo.childImageSharp.fixed} />


          <h2 className={style.groupTitle}>{card.name}</h2>
        </div>
        
        <div className={style.roles}>
          {roles}
        </div>
      </div>
    )
  })
}

export default function PoliticianPage({ data }) {
  const politician = data.strapiPolitician
  const party = politician.political_party

  let role = ""
  try {
    role = politicianRole(politician, data.allStrapiPoliticalEntities.nodes)
  } catch (err) {}

  return (
    <Layout>
      <SEO title={politicianName(politician)} />

      <div className={style.grid}>
        <div className={style.column}>
          <div className={`${style.name} ${style.card}`}>
            <Img
              fixed={politician.photo.childImageSharp.fixed}
              imgStyle={{
                borderRadius: 200,
              }}
              style={{
                minWidth: 150
              }}
            />

            <div className={style.text}>
              <h1>{politicianName(politician)}</h1>
              <p className={style.role}>{role}</p>
              <PartyTag party={politician.political_party} />
            </div>
          </div>

          <div className={`${style.about} ${style.card}`}>
            <h2 className={style.cardTitle}>Om {politician.first_name}</h2>

            <div className={style.facts}>
              <div className={style.fact}>
                <span className={style.factName}>Fødselsdag</span>

                <span className={style.factValue}>{parseBirthday(politician.birthday)}</span>
              </div>
            </div>
          </div>

          <div className={`${style.party} ${style.card}`}>
            <div className={style.header}>
              <Img fixed={party.logo.childImageSharp.fixed} />

              <h3>{party.name}</h3>
            </div>
          </div>
        </div>

        <div className={style.column}>
          <div className={`${style.education} ${style.card}`}>
            <h2 className={style.cardTitle}>Uddannelse</h2>

            {politicianExperience(
              getPoliticianExperienceOfType(politician, "education"),
              "Ingen uddanelse registreret."
            )}
          </div>

          <div className={`${style.education} ${style.card}`}>
            <h2 className={style.cardTitle}>CV</h2>

            {politicianExperience(
              getPoliticianExperienceOfType(politician, "work"),
              "Intet tidligere arbejde fundet."
            )}
          </div>
        </div>

        <div className={style.column}>
          {politicalGroupCards(politician, data.allStrapiPoliticalEntities.nodes, data.allStrapiPoliticalEntityGroups.nodes)}
        </div>
      </div>
    </Layout>
  )
}

export const query = graphql`
  query($slug: String!) {
    strapiPolitician(slug: { eq: $slug }) {
      strapiId
      first_name
      last_name
      middle_name
      photo_credit
      prefers_middle_name_shown
      birthday
      photo {
        childImageSharp {
          fixed(width: 150, height: 150, cropFocus: NORTH, quality: 100) {
            ...GatsbyImageSharpFixed_withWebp
          }
        }
      }
      experiences {
        place
        to
        from
        type
        title
      }
      political_memberships {
        political_membership_type
        political_entity
        from
        to
      }
      political_entity_groups {
        political_entity
        vice_chairman
        name
        id
        chairman
      }
      political_party {
        monochrome_logo {
          childImageSharp {
            fixed(width: 24, height: 24, quality: 100) {
              ...GatsbyImageSharpFixed_withWebp_tracedSVG
            }
          }
        }
        logo {
          childImageSharp {
            fixed(width: 75, quality: 100) {
              ...GatsbyImageSharpFixed_withWebp_tracedSVG
            }
          }
        }
        color
        dark_text
        name
      }
    }
    allStrapiPoliticalEntities {
      nodes {
        strapiId
        name
        type
        political_membership_types {
          name
          importance
          id
        }
        logo {
          childImageSharp {
            fixed(height: 80, quality: 100) {
              ...GatsbyImageSharpFixed_withWebp_tracedSVG
            }
          }
        }
      }
    }
    allStrapiPoliticalEntityGroups {
      nodes {
        name
        strapiId
        id
        political_entity {
          id
        }
      }
    }
  }
`
