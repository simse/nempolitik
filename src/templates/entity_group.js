import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

import SEO from "../components/seo"
import Layout from "../components/layout"

import style from "../style/pages/entity-group.module.scss"
import PoliticianCard from "../page-components/politician-card"


export default function PoliticalPartyPage({ data, pageContext }) {
  let members = data.politicalEntityGroup.politicians
  const group = data.politicalEntityGroup

  members.sort((firstMember, secondMember) => {
    // Put chairman first
    if (firstMember === group.chairman) {
      return -1
    } else if (secondMember === group.chairman) {
      return 1
    }

    // Put vice chairman second
    if (secondMember !== group.chairman && firstMember === group.vice_chairman) {
      return -1
    } else if (firstMember !== group.chairman && secondMember === group.vice_chairman) {
      return 1
    }

    return 0
  })

  return (
    <Layout>
      <SEO title={data.politicalEntityGroup.name} />

      <div className={style.header}>
        <Img fixed={data.politicalEntity.logo.childImageSharp.fixed} style={{
          margin: "0 auto 30px auto",
          display: "block"
        }} />
        <h1 className={style.title}>{data.politicalEntityGroup.name}</h1>
        <p>i { data.politicalEntity.name }</p>
      </div>
      

      <div className={style.members}>
        <h2>Alle medlemmer</h2>
        <p>{ members.length } politikere</p>

        <div className={style.cards}>
        {members.map(member => (
          <PoliticianCard politicianId={member} entityGroupFilter={pageContext.groupId} key={member} />
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
      vice_chairman
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