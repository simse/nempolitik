import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

import SEO from "../components/seo"
import Layout from "../components/layout"

import style from "../style/pages/municipality.module.scss"

export default function MunicipalityPage({ data }) {
  const entity = data.strapiPoliticalEntities

  return (
    <Layout>
      <SEO title={ entity.name } />
      <div className={style.municipality}>
        <Img fixed={entity.logo.childImageSharp.fixed} />

        <h2>{ entity.name }</h2>
      </div>

    </Layout>
  )
}

export const query = graphql`
  query($slug: String!) {
    strapiPoliticalEntities(slug: {eq: $slug}) {
      address
      email
      established
      id
      name
      phone_number
      phone_number_calling_code
      logo {
        childImageSharp {
          fixed(height: 100, quality: 100) {
            ...GatsbyImageSharpFixed_withWebp
          }
        }
      }
    }
  }
`
