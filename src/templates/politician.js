import React from "react"
import { graphql } from "gatsby"
// import Img from "gatsby-image"

import SEO from "../components/seo"
import Layout from "../components/layout"

import style from "../style/pages/politician.module.scss"

export default function PoliticianPage({ data }) {
  const politician = data.strapiPolitician

  return (
    <Layout>
      <SEO title={ politician.first_name } />
      <div className={style.politician}>
        <div>
          

          <h1>{politician.first_name}</h1>
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
    }
  }
`
