import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

import SEO from "../components/seo"
import Layout from "../components/layout"

import style from "../style/pages/municipality.module.scss"

export default function MunicipalityPage({ data }) {
  const entity = data.politicalEntity

  return (
    <Layout>
      <SEO title={ entity.name } />
      <div className={style.municipality}>
        <Img fixed={entity.logo.childImageSharp.fixed} />

        <h2>{ entity.name }</h2>

        dfd
      </div>

    </Layout>
  )
}

export const query = graphql`
  query($id: String!) {
    politicalEntity(id: {eq: $id}) {
      name
      group_name
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