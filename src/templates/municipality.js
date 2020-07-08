import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

import SEO from "../components/seo"
import Layout from "../components/layout"

import style from "../style/pages/municipality.module.scss"

export default function MunicipalityPage({ data }) {
  const entity = data.politicalEntity

  return (
    <Layout width={2000}>
      <SEO title={ entity.name } />
      <div className={style.municipality}>
        <div className={style.header}>
          <div className={style.meta}>

            <h1>{ entity.name }</h1>
            <p>{ entity.subtitle }</p>
            
          </div>

          <Img className={style.banner} fluid={entity.banner.childImageSharp.fluid} style={{
            maxHeight: "90vh"
          }} />
        </div>

        <div className={style.content}>
          
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
    }
  }
`