import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Img from "gatsby-image"

import style from "../style/components/party-tag.module.scss"

const PartyTag = ({ partyId }) => {
  const allParties = useStaticQuery(
    graphql`
      query {
        allStrapiPoliticalParties {
          nodes {
            dark_text
            color
            monochrome_logo {
              childImageSharp {
                fixed(height: 24) {
                  ...GatsbyImageSharpFixed_withWebp_tracedSVG
                }
              }
            }
            name
            strapiId
          }
        }
      }
    `
  ).allStrapiPoliticalParties.nodes

  const party = allParties.find(search => {
    return search.strapiId === partyId
  })

  return (
    <div
      className={`${style.partyTag} ${party.dark_text ? style.dark : ""}`}
      style={{
        background: party.color
      }}
    >
      <Img
        fixed={party.monochrome_logo.childImageSharp.fixed}
        alt={party.name + "'s logo"}
        style={{
          minWidth: 24
        }}
      />

      <span className={`${party.dark_text ? style.dark : ""}`}>
        {party.name}
      </span>
    </div>
  )
}

export default PartyTag
