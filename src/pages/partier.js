import React from "react"
import { graphql } from "gatsby"
import { Row, Col } from 'react-grid-system'

import Layout from "../components/layout"
import SEO from "../components/seo"
import PoliticalPartyCard from "../page-components/political-party-card"

const PartiesPage = ({data}) => (
  <Layout>
    <SEO title="Partier" />
    <h1 style={{
      marginTop: 100
    }}>Partier</h1>
    <p style={{
      marginBottom: 40
    }}>Alle partier i Danmark, plus nogle fra Grønland og Færøerne.</p>
    
    <Row>
    {data.allPoliticalParties.nodes.map(value => (
      <Col sm={12} md={6} lg={4}>
        <PoliticalPartyCard politicalParty={value} key={value.id} />
      </Col>
    ))}
    </Row>
    


    
    
  </Layout>
)

export default PartiesPage


export const query = graphql`
query {
  allPoliticalParties: allPoliticalParty {
    nodes {
      id
      color
      established
      headquarters
      name
      political_leaning
      slug
      symbol
      logo {
        childImageSharp {
          fixed(width: 60, quality: 100) {
            ...GatsbyImageSharpFixed_withWebp_tracedSVG
          }
        }
      }
    }
  }
}
`