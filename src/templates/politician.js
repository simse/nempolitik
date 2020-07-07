import React from "react"
import { graphql, Link } from "gatsby"
import Img from "gatsby-image"
import moment from "moment"
import 'moment/locale/da'

import SEO from "../components/seo"
import Layout from "../components/layout"

import style from "../style/pages/politician.module.scss"
import {
  getPoliticianExperienceOfType, 
} from "../util.js"
import PartyTag from "../components/party-tag"
import PoliticianRole from "../page-components/politician-role"


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
        range = experience.from
      } else {
        range = experience.from + " — " + experience.to
      }

      let key = experience.title + experience.place

      return (
        <div className={style.entry} key={key}>
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


const politicalGroupCards = (politician) => {
  // Find groups this politician is member of
  if (politician.memberships.length === 0) {
    return (
      <div className={`${style.card} ${style.noMembership}`}>
        Denne politiker er ikke en del af nogle byråd, regionråd eller regeringer.
      </div>
    )
  }

  let cards = {}

  // Check every political membership
  politician.memberships.forEach(membership => {
    // Check if card has already been created
    if (membership.political_entity.id in cards) return

    // Determine if political membership has ended
    if (membership.to) {
      let date = moment(membership.to)
      let currentDate = moment.now()

      if (date < currentDate) {
        return
      }
    }

    let political_entity = membership.political_entity
    let title = <PoliticianRole politician={politician} entityFilter={political_entity.id} />

    cards[political_entity.id] = {
      name: political_entity.name,
      logo: political_entity.logo,
      title: title,
      group_name: political_entity.group_name,
      roles: []
    }
  })

  // Check every political group (child political entity)
  politician.group_memberships.forEach(group => {
    let political_entity = group.political_entity

    let roles = []

    let url = "/" +  political_entity.urlPrefix + political_entity.slug + "/udvalg/" + group.slug


    // Check if chairman
    if (politician.id === group.chairman) {
      roles.push({
        id: group.name,
        title: (
          <>Formand for <Link to={url}>{group.name}</Link></>
        ),
        importance: 20
      })
    // Check if vice chairman
    } else if (politician.id === group.vice_chairman) {
      roles.push({
        id: group.name,
        title: (
          <>Næstformand for <Link to={url}>{group.name}</Link></>
        ),
        importance: 10
      })
    } else {
      roles.push({
        id: group.name,
        title: (
          <>Medlem af <Link to={url}>{group.name}</Link></>
        ),
        importance: 1
      })
    }

    if (political_entity.id in cards) {
      cards[political_entity.id].roles = cards[political_entity.id].roles.concat(roles)
    }
  })

  // Generate card output
  return Object.values(cards).map(card => {
    // Sort roles array by importance (to show chairman and vice chairman first)
    let sortedRoles = card.roles
    sortedRoles.sort((a,b) => (a.importance < b.importance) ? 1 : ((b.importance < a.importance) ? -1 : 0))

    let roles = sortedRoles.map(role => (
      <div className={style.role} key={role.id}>
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
          <p className={style.role}>
            {card.title}
          </p>
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
  const party = politician.party

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
              <p className={style.role}><PoliticianRole politician={politician} /></p>
              <PartyTag party={party} />
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
              politician
            )
          }
        </div>
      </div>
    </Layout>
  )
}

export const query = graphql`
  query($slug: String!) {
    politician: politician(slug: {eq: $slug}) {
      id
      birthday
      name
      photo_credit
      party {
        id
        name
        slug
        color
        dark_text
        monochrome_logo {
          childImageSharp {
            fixed(height: 24) {
              ...GatsbyImageSharpFixed_withWebp_tracedSVG
            }
          }
        }
        logo {
          childImageSharp {
            fixed(height: 60) {
              ...GatsbyImageSharpFixed_withWebp_tracedSVG
            }
          }
        }
      }
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
      memberships {
        from
        to
        political_entity {
          name
          id
          group_name
          type
          logo {
            childImageSharp {
              fixed(height: 60) {
                ...GatsbyImageSharpFixed_withWebp_tracedSVG
              }
            }
          }
        }
        political_entity_membership_type {
          id
          name
          importance
        }
      }
      group_memberships {
        name
        vice_chairman
        chairman
        slug
        political_entity {
          slug
          urlPrefix
          id
          type
        }
      }
    }
  }
`