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
      {data.allPoliticians.nodes.map(value => (
        <PoliticianCard
          politician={value}
          key={value.id}
        />
      ))}
    </Equalizer>
  </Layout>
)

export default PoliticiansPage


export const query = graphql`
query {
  allPoliticians: allPolitician {
    nodes {
      id
      name
      slug
      party
      photo {
          childImageSharp {
            fixed(width: 100, height: 100, cropFocus: NORTH, quality: 100) {
              ...GatsbyImageSharpFixed_withWebp
            }
          }
        }
    }
  }
}
`