import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

import SEO from "../components/seo"
import Layout from "../components/layout"

import style from "../style/pages/entity-group.module.scss"
import PoliticianCard from "../page-components/politician-card"


export default function PoliticalPartyPage({ data }) {
  const members = data.politicalEntityGroup.politicians

  return (
    <Layout>
      <SEO title={data.politicalEntityGroup.name} />

      <Img fixed={data.politicalEntity.logo.childImageSharp.fixed} style={{
        margin: "50px auto 20px auto",
        display: "block"
      }} />
      <h1 className={style.title}>{data.politicalEntityGroup.name}</h1>

      <div className={style.members}>
        <h2>Medlemmer</h2>

        <div className={style.cards}>
        {members.map(member => (
          <PoliticianCard politicianId={member} />
        ))}
        </div>
      </div>

    </Layout>
  )
}

export const query = graphql`
  query($groupId: String!, $entityId: String!) {
    politicalEntityGroup(id: {eq: $groupId}) {
      chairman
      name
      politicians
    }
    politicalEntity(id: {eq: $entityId}) {
      name
      type
      logo {
        childImageSharp {
          fixed(width: 80, quality: 100) {
            ...GatsbyImageSharpFixed_withWebp_tracedSVG
          }
        }
      }
    }
  }
`