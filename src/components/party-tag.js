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

  console.log(partyId)

  const party = allParties.find(search => {
    console.log(search)
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
      />

      <span className={`${party.dark_text ? style.dark : ""}`}>
        {party.name}
      </span>
    </div>
  )
}

export default PartyTag
