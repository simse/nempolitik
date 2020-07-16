import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

import SEO from "../components/seo"
import Layout from "../components/layout"

import style from "../style/pages/political-party.module.scss"

export default function PoliticalPartyPage({ data }) {
  const party = data.politicalParty

  return (
    <Layout theme={party.theme}>
      <SEO title={ party.name } />
      <div className={style.party}>
        <div className={style.header}>
          <Img fixed={party.logo.childCloudinaryAsset.fixed} alt={party.name + "'s logo"} />

          <h1>{party.name}</h1>
        </div>
      </div>

    </Layout>
  )
}

export const query = graphql`
  query($id: String!) {
    politicalParty(id: {eq: $id}) {
      color
      established
      headquarters
      political_leaning
      symbol
      name
      theme
      logo {
        childCloudinaryAsset {
          fixed(width: 70) {
            ...CloudinaryAssetFixed
          }
        }
      }
    }
  }
`