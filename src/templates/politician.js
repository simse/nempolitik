import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

import SEO from "../components/seo"
import Layout from "../components/layout"

import style from "../style/pages/politician.module.scss"
import {politicianName, politicianRole} from "../util.js"

export default function PoliticianPage({ data }) {
  const politician = data.strapiPolitician
  let role = ""
  try {
    role = politicianRole(politician, data.allStrapiPoliticalEntities.nodes)
  } catch(err) {}

  return (
    <Layout>
      <SEO title={ politicianName(politician) } />
      <div>
        <div className={style.header}>
          <Img fixed={politician.photo.childImageSharp.fixed} imgStyle={{
            borderRadius: 100
          }} />

          <h1>{politicianName(politician)}</h1>
          <p className={style.role}>{role}</p>
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
          fixed(width: 170, height: 170, cropFocus: NORTH, quality: 100) {
            ...GatsbyImageSharpFixed_withWebp
          }
        }
      }
      political_memberships {
        political_membership_type
        political_entity
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
