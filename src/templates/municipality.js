import React from "react"
import { graphql, Link } from "gatsby"
import Img from "gatsby-image"
import { uniqBy } from "lodash"

import Slider from "../components/slider"
import PoliticianCard from "../page-components/politician-card"
import SEO from "../components/seo"
import Layout from "../components/layout"

import { BsGeoAlt, BsFillPeopleFill } from "react-icons/bs"
import style from "../style/pages/municipality.module.scss"

const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function MunicipalityPage({ data }) {
  const entity = data.politicalEntity
  const population =  numberWithCommas(entity.population)
  let members = uniqBy(data.members.nodes, "id")

  let cards = members.map(member => <PoliticianCard politician={member} key={member.id} />)
  let groupCards = entity.groups.map(group => {
    let url = "/" + entity.urlPrefix + entity.slug + "/udvalg/" + group.slug


    return (
      <Link to={url}>
        <div className={style.entityGroupCard}>
          <h3>{group.name}</h3>
        </div>
      </Link>
    )
  })


  return (
    <Layout width={2000}>
      <SEO title={ entity.name } />
      <div className={style.municipality}>
        <div className={style.header}>
          <div className={style.meta}>

            <h1>{ entity.name }</h1>


            <div className={style.tags}>
              <span><BsGeoAlt /> { entity.location }</span>

              <span><BsFillPeopleFill /> { population } indbyggere</span>
            </div>

            <p>{ entity.subtitle }</p>
            
          </div>

          <Img className={style.banner} fluid={entity.banner.childImageSharp.fluid} style={{
            maxHeight: "90vh"
          }} />
        </div>

        <div className={style.content}>
          <h2 className={style.sectionTitle}>Byrådet</h2> 

          <Slider cards={cards} />
        </div>

        <div className={style.content}>
          <h2 className={style.sectionTitle}>{entity.group_name}</h2> 

          <Slider cards={groupCards} />
        </div>
      </div>

    </Layout>
  )
}

export const query = graphql`
  query($id: String!) {
    politicalEntity(id: {eq: $id}) {
      name
      subtitle
      group_name
      location
      population
      urlPrefix
      slug
      logo {
        childImageSharp {
          fixed(height: 140, quality: 100) {
            ...GatsbyImageSharpFixed_withWebp
          }
        }
      }
      banner {
        childImageSharp {
          fluid(maxWidth: 2000, maxHeight: 1500, quality: 100) {
            ...GatsbyImageSharpFluid_withWebp
          }
        }
      }
      groups {
        slug
        name
      }
    }
    members: allPolitician(filter: {memberships: {elemMatch: {political_entity: {id: {eq: $id}}}}}) {
      nodes {
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
        memberships {
          from
          to
          political_entity {
            name
            id
            group_name
            type
          }
          political_entity_membership_type {
            id
            name
            importance
          }
        }
      }
    }
  }
`