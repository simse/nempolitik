import React from "react"
import { graphql, Link } from "gatsby"
import Img from "gatsby-image"
import { uniqBy } from "lodash"

import SEO from "../components/seo"
import Layout from "../components/layout"
import Footer from "../components/footer"
import Slider from "../components/slider"
import PoliticianCard from "../page-components/politician-card"

import { BsGeoAlt, BsFillPeopleFill } from "react-icons/bs"
import style from "../style/pages/entity.module.scss"

const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function MunicipalityPage({ data }) {
  const entity = data.politicalEntity
  const population =  numberWithCommas(entity.population)
  let members = uniqBy(data.members.nodes, "id")

  let cards = members.map(member => <PoliticianCard politician={member} key={member.id} />)
  let groups = entity.groups

  if (groups === null) {
    groups = []
  }

  let groupCards = groups.map(group => {
    let url = "/" + entity.urlPrefix + entity.slug + "/udvalg/" + group.slug

    let photos = group.politicians.map(politician => {
      return politician.tiny_photo.childImageSharp.fixed
    })

    return (
      <Link to={url} style={{
        textDecoration: "none",
        color: "#000"
      }}>
        <div className={style.entityGroupCard} key={group.id}>
          {photos.map(photo => (
            <Img key={photo.originalName} fixed={photo} style={{
              borderRadius: 100,
              marginRight: 5
            }} />
          ))}

          <h3>{group.name}</h3>
        </div>
      </Link>
    )
  })

  let membersTitle = ""
  if (entity.type === "municipality") {
    membersTitle = "Byrådet"
  } else if(entity.type === "region") {
    membersTitle = "Regionsrådet"
  }

  return (
    <Layout width={3000}>
      <SEO title={ entity.name } />
      <div className={style.municipality}>
        <div className={style.header}>
          <div className={style.meta}>
            <Img fixed={entity.logo.childCloudinaryAsset.fixed} style={{
              marginBottom: 40
            }} />

            <h1>{ entity.name }</h1>


            <div className={style.tags}>
              <span><BsGeoAlt /> { entity.location }</span>

              <span><BsFillPeopleFill /> { population } indbyggere</span>
            </div>

            <p>{ entity.subtitle }</p>
            
          </div>

          <Img className={style.banner} fluid={entity.banner.childCloudinaryAsset.fluid} style={{
            maxHeight: "90vh",
            overflow: "hidden"
          }} />
        </div>

        <div className={style.content}>
          <h2 className={style.sectionTitle}>{membersTitle}</h2> 

          <Slider cards={cards} />
        </div>

        {groups.length > 0 &&
        <div className={style.content}>
          <h2 className={style.sectionTitle}>{entity.group_name}</h2> 

          <Slider cards={groupCards} />
        </div>}
      </div>

      <Footer />
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
      type
      logo {
        childCloudinaryAsset {
          fixed(width: 100) {
            ...CloudinaryAssetFixed
          }
        }
      }
      banner {
        childCloudinaryAsset {
          fluid(maxWidth: 3000) {
            ...CloudinaryAssetFluid
          }
        }
      }
      groups {
        id
        slug
        name
        politicians {
          tiny_photo: photo {
            childImageSharp {
              fixed(width: 32, height: 32, cropFocus: NORTH, quality: 100) {
                originalName
                ...GatsbyImageSharpFixed
              }
            }
          }
        }
      }
    }
    members: allPolitician(filter: {memberships: {elemMatch: {political_entity: {id: {eq: $id}}}}}) {
      nodes {
        id
        name
        slug
        photo {
          childCloudinaryAsset {
            fixed(width: 100) {
              ...CloudinaryAssetFixed
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
            childCloudinaryAsset {
              fixed(width: 24) {
                ...CloudinaryAssetFixed
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