import React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

const IndexPage = ({data}) => (
  <Layout>
    <SEO title="Forside" />
    <h1>Hej...</h1>
    <p>Denne hjemmeside er ikke heeelt færdig. Tjek tilbage om en måneds tid.</p>
    
  </Layout>
)

export default IndexPage


export const query = graphql`
  query AllPoliticians {
    allStrapiPolitician {
      nodes {
        Birthday
        first_name
        last_name
        middle_name
        photo_credit
        prefers_middle_name_shown
      }
    }
  }
`