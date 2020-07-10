import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"
import slugify from "slugify"

import SEO from "../components/seo"
import Layout from "../components/layout"

import style from "../style/pages/entity-group.module.scss"
import PoliticianCard from "../page-components/politician-card"
import MeetingVideo from "../components/meeting-video"
import Slider from "../components/slider"

export default function PoliticalPartyPage({ data, pageContext }) {
  let members = data.politicalEntityGroup.politicians
  const group = data.politicalEntityGroup
  let meetings = data.politicalEntityGroup.meetings
  const entity = data.politicalEntity


  if (meetings === null) {
    meetings = []
  }

  meetings.forEach(meeting => {
    meeting.url = "/" + entity.urlPrefix + entity.slug + "/udvalg/" + group.slug + "/" + slugify(meeting.name, {
      lower: true,
      strict: true
    }) + "-" + meeting.slug_datetime
  })

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

  let memberCards = members.map(member => <PoliticianCard politician={member} id={member.id} entityGroupFilter={pageContext.groupId} />)
  let meetingCards = meetings.map(meeting => <MeetingVideo meeting={meeting} url={meeting.url} />)

  return (
    <Layout width={2000}>
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
          <div className={style.sectionHeader}>
            <h2 className={style.sectionTitle}>Medlemmer</h2>
            <p>{ members.length } politikere</p>
          </div>

          <Slider cards={memberCards} />
        </div>

        {meetings.length !== 0 &&
        <div className={style.meetings}>
          <div className={style.sectionHeader}>
            <h2 className={style.sectionTitle}>Udvalgsmøder</h2>
            
          </div>

          <Slider cards={meetingCards} />
        </div>
        }
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
      slug
      meetings {
        slug_datetime: datetime(formatString: "YYYY-MM-DD")
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
      slug
      urlPrefix
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