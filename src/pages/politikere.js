import React from "react"
import { graphql } from "gatsby"
import Equalizer from "react-equalizer"

import Layout from "../components/layout"
import SEO from "../components/seo"
import PoliticianCard from "../page-components/politician-card"
import style from "../style/pages/politicians.module.scss"

const PoliticiansPage = ({data}) => (
  <Layout>
    <SEO title="Politikere" />
    <h1 style={{
      marginTop: 35
    }}>Politikere</h1>
    <p style={{
      marginBottom: 40
    }}>Alle politikere i Danmark.</p>

    <Equalizer byRow={true} className={style.row}>
      {data.allStrapiPolitician.nodes.map(value => (
        <PoliticianCard
          politician={value}
          politicalEntities={data.allStrapiPoliticalEntities.nodes}
          key={value.id}
        />
      ))}
    </Equalizer>
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
      photo_credit
      slug
      prefers_middle_name_shown
      political_party {
        color
        symbol
        name
        dark_text
        slug
        monochrome_logo {
          childImageSharp {
            fixed(width: 24, height: 24, quality: 100) {
              ...GatsbyImageSharpFixed_withWebp
            }
          }
        }
      }
      political_memberships {
        political_membership_type
        political_entity
        from
        to
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