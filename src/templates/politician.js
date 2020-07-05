import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"
import moment from "moment"
import 'moment/locale/da'

import SEO from "../components/seo"
import Layout from "../components/layout"

import style from "../style/pages/politician.module.scss"
import {
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
  let birthdayString = moment(birthDate).format('LL');

  return birthdayString + ` (${age} år)`
}


const politicalGroupCards = (politician, political_memberships, political_entities, political_membership_types/*, political_entity_groups*/) => {
  // Find relevant memberships
  let memberships = political_memberships.filter(membership => {
    return membership.politician === politician.id
  })

  // Find groups this politician is member of
  if (memberships.length === 0) {
    return (
      <div className={`${style.card} ${style.noMembership}`}>
        Denne politiker er ikke en del af nogle byråd, regionråd eller regeringer.
      </div>
    )
  }

  let cards = {}

  // Check every political membership
  memberships.forEach(membership => {
    // Check if card has already been created
    if (membership.political_entity in cards) return

    // Determine if political membership has ended
    if (membership.to) {
      let date = moment(membership.to)
      let currentDate = moment.now()

      if (date < currentDate) {
        return
      }
    }

    let political_entity = political_entities.find(entity => {
      return entity.id === membership.political_entity
    })

    let title = politicianRole(politician, political_entities, political_memberships, political_membership_types, political_entity.id)

    console.log(political_entity)

    cards[political_entity.id] = {
      name: political_entity.name,
      logo: political_entity.logo,
      title: title,
      group_name: political_entity.political_group_name,
      roles: []
    }
  })
/*
  // Check every political group (child political entity)
  politician.political_entity_groups.forEach(group => {
    let political_entity = political_entities.find(entity => {
      return entity.strapiId === group.political_entity
    })

    let roles = []

    // Check if chairman
    if (politician.strapiId === group.chairman) {
      roles.push({
        title: "Formand for " + group.name,
        importance: 20
      })
    // Check if vice chairman
    } else if (politician.strapiId === group.vice_chairman) {
      roles.push({
        title: "Næstformand for " + group.name,
        importance: 10
      })
    } else {
      roles.push({
        title: "Medlem af " + group.name,
        importance: 1
      })
    }

    if (political_entity.strapiId in cards) {
      cards[political_entity.strapiId].roles = cards[political_entity.strapiId].roles.concat(roles)
    }
  })*/

  // Generate card output
  return Object.values(cards).map(card => {
    // Sort roles array by importance (to show chairman and vice chairman first)
    let sortedRoles = card.roles
    sortedRoles.sort((a,b) => (a.importance < b.importance) ? 1 : ((b.importance < a.importance) ? -1 : 0))

    let roles = sortedRoles.map(role => (
      <div className={style.role} key={role.title}>
        {role.title}
      </div>
    ))

    let groupTitle = ""
    if (card.roles.length > 0) {
      groupTitle = <h3 className={style.groupName}>{ card.group_name }</h3>
    }

    return (
      <div className={`${style.card} ${style.politicalGroup}`} key={card.name}>
        <div className={style.header}>
          <Img fixed={card.logo.childImageSharp.fixed} />


          <h2 className={style.groupTitle}>{card.name}</h2>
          <p className={style.role}>{ card.title }</p>
        </div>
        
        <div className={style.roles}>
          {groupTitle}
          {roles}
        </div>
      </div>
    )
  })
}

export default function PoliticianPage({ data }) {
  const politician = data.politician
  const party = data.allPoliticalParties.nodes.find(search => {
    return search.id === politician.party
  })

  let role = ""
  try {
    role = politicianRole(politician, data.allPoliticalEntities.nodes, data.allPoliticalEntityMemberships.nodes, data.allPoliticalEntityMembershipTypes.nodes)
  } catch (err) {}

  return (
    <Layout>
      <SEO title={politician.name} />

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
              <h1>{politician.name}</h1>
              <p className={style.role}>{role}</p>
              <PartyTag partyId={party.id} />
            </div>
          </div>

          <div className={`${style.about} ${style.card}`}>
            <h2 className={style.cardTitle}>Om {politician.name}</h2>

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
          {
            politicalGroupCards(
              politician,
              data.allPoliticalEntityMemberships.nodes,
              data.allPoliticalEntities.nodes,
              data.allPoliticalEntityMembershipTypes.nodes
            )
          }
        </div>
      </div>
    </Layout>
  )
}

export const query = graphql`
  query($slug: String!) {
    politician: markdown(slug: {eq: $slug}) {
      id
      birthday
      name
      photo_credit
      party
      photo {
        childImageSharp {
          fixed(width: 150, height: 150, cropFocus: NORTH, quality: 100) {
            ...GatsbyImageSharpFixed_withWebp
          }
        }
      }
      experience {
        from
        place
        title
        to
        type
      }
    }
    allPoliticalParties: allMarkdown(filter: {type: {eq: "political_party"}}) {
      nodes {
        name
        id
        logo {
          childImageSharp {
            fixed(width: 80, quality: 100) {
              ...GatsbyImageSharpFixed_withWebp
            }
          }
        }
      }
    }
    allPoliticalEntities: allMarkdown(filter: {type: {eq: "political_entity"}}) {
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
    allPoliticalEntityMembershipTypes: allMarkdown(filter: {type: {eq: "political_entity_membership_type"}}) {
      nodes {
        name
        importance
        political_entities
        id
      }
    }
    allPoliticalEntityMemberships: allMarkdown(filter: {type: {eq: "political_membership"}}) {
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