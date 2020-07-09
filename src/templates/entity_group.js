import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

import SEO from "../components/seo"
import Layout from "../components/layout"

import style from "../style/pages/entity-group.module.scss"
import PoliticianCard from "../page-components/politician-card"
import MeetingVideo from "../components/meeting-video"

export default function PoliticalPartyPage({ data, pageContext }) {
  let members = data.politicalEntityGroup.politicians
  const group = data.politicalEntityGroup
  let meetings = data.politicalEntityGroup.meetings


  if (meetings === null) {
    meetings = []
  }

  members.sort((firstMember, secondMember) => {
    // Put chairman first
    if (firstMember.id === group.chairman) {
      return -1
    } else if (secondMember.id === group.chairman) {
      return 1
    }

    // Put vice chairman second
    if (secondMember.id !== group.chairman && firstMember.id === group.vice_chairman) {
      return -1
    } else if (firstMember.id !== group.chairman && secondMember.id === group.vice_chairman) {
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
      

      <div className={style.content}>
        <div className={style.members}>
          <h2 className={style.sectionTitle}>Alle medlemmer</h2>
          <p>{ members.length } politikere</p>

          <div className={style.cards}>
          {members.map(member => (
            <PoliticianCard politician={member} entityGroupFilter={pageContext.groupId} key={member.id} />
          ))}
          </div>
        </div>

        <div className={style.meetings}>
          <h2 className={style.sectionTitle}>Udvalgsmøder</h2>

          <div className={style.meetingsGrid}>
          {meetings.map(meeting => {        
            return (
              <MeetingVideo meeting={meeting} />
            )
          })}
          </div>
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
      vice_chairman
      meetings {
        datetime
        name
        thumbnail {
          childImageSharp {
            fluid(maxWidth: 720, maxHeight: 400, quality: 100) {
              ...GatsbyImageSharpFluid_withWebp
            }
          }
        }
        video_url
      }
      politicians {
        id
        name
        slug
        photo {
          childImageSharp {
            fixed(width: 100, height: 100, cropFocus: NORTH, quality: 100) {
              ...GatsbyImageSharpFixed_withWebp
            }
          }
        }
        group_memberships {
          chairman
          vice_chairman
          id
          name
        }
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
        }
      }
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