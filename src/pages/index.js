import React from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"

const IndexPage = () => (
  <Layout>
    <SEO title="Forside" />
    <h1 style={{
      marginTop: 100
    }}>Hej med dig...</h1>
    <p>Denne hjemmeside er ikke heeelt færdig. Tjek tilbage om en måneds tid.</p>
    
  </Layout>
)

export default IndexPage