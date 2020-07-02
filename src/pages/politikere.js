import React from "react"
import { graphql } from "gatsby"
import { Row, Col } from 'react-grid-system'

import Layout from "../components/layout"
import SEO from "../components/seo"
import PoliticianCard from "../page-components/politician-card"

const PoliticiansPage = ({data}) => (
  <Layout>
    <SEO title="Politikere" />
    <h1>Politikere</h1>
    <p style={{
      marginBottom: 40
    }}>Alle politikere i Danmark.</p>

    <Row>
    {data.allStrapiPolitician.nodes.map(value => (
      <Col sm={12} md={6} lg={4} xl={3}>
        <PoliticianCard
          politician={value}
          politicalEntities={data.allStrapiPoliticalEntities.nodes}
          key={value.id}
        />
      </Col>
    ))}
    </Row>
  </Layout>
)

export default PoliticiansPage


export const query = graphql`
query {
  allStrapiPolitician {
    nodes {
      id
      first_name
      last_name
      middle_name
      Birthday
      photo_credit
      slug
      prefers_middle_name_shown
      political_party {
        color
        symbol
      }
      political_memberships {
        political_membership_type
        political_entity
      }
      photo {
        childImageSharp {
          fixed(width: 100, height: 100, cropFocus: NORTH, quality: 100) {
            ...GatsbyImageSharpFixed_withWebp
          }
        }
      }
    }
  }
  allStrapiPoliticalEntities {
    nodes {
      strapiId
      name
      type
      political_membership_types {
        name
        importance
        id
      }
    }
  }
}
`