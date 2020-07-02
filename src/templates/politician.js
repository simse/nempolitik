import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

import SEO from "../components/seo"
import Layout from "../components/layout"

import style from "../style/pages/politician.module.scss"
import {politicianName, politicianRole, getPoliticianExperienceOfType} from "../util.js"
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
      } else {
        range = experience.from + " — " + experience.to
      }

      return (
        <div className={style.entry}>
          <h3>{ experience.title }</h3>
          <span>{ experience.place }</span>
          <p>{range}</p>
        </div>
      )
    })

    return list
  }
}

export default function PoliticianPage({ data }) {
  const politician = data.strapiPolitician
  const party = politician.political_party

  let role = ""
  try {
    role = politicianRole(politician, data.allStrapiPoliticalEntities.nodes)
  } catch(err) {}

  return (
    <Layout>
      <SEO title={ politicianName(politician) } />
      <div className={style.grid}>

        <div className={style.column}>
          <div className={`${style.name} ${style.card}`}>
            <Img fixed={politician.photo.childImageSharp.fixed} imgStyle={{
              borderRadius: 100
            }} />

            <div className={style.text}>
              <h1>{politicianName(politician)}</h1>
              <p className={style.role}>{role}</p>
              <PartyTag party={politician.political_party} />
            </div>
          </div>

          <div className={`${style.party} ${style.card}`}>
            <div className={style.header}>
              <Img fixed={party.logo.childImageSharp.fixed} />

              <h3>{ party.name }</h3>
            </div>

            <p>Medlem siden 2001</p>
          </div>

          <div className={`${style.education} ${style.card}`}>
            <h2 className={style.cardTitle}>Uddannelse</h2>

            {politicianExperience(getPoliticianExperienceOfType(politician, "education"), "Ingen uddanelse registreret.")}
          </div>

        </div>

        <div className={style.column}>
          <div className={`${style.education} ${style.card}`}>
            <h2 className={style.cardTitle}>Arbejde</h2>

            {politicianExperience(getPoliticianExperienceOfType(politician, "work"), "Intet tidligere arbejde fundet.")}
          </div>
        </div>

        <div className={style.column}>
          test
        </div>
        
      </div>

    </Layout>
  )
}

export const query = graphql`
  query($slug: String!) {
    strapiPolitician(slug: {eq: $slug}) {
      first_name
      Birthday
      last_name
      middle_name
      photo_credit
      prefers_middle_name_shown
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
      }
    }
  }
`
