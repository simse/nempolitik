import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Img from "gatsby-image"

import style from "../style/components/party-tag.module.scss"

const PartyTag = ({ partyName }) => {
  const allParties = useStaticQuery(
    graphql`
      query {
        allMarkdownRemark(filter: {fileAbsolutePath: {regex: "/(parties)/"}}) {
          nodes {
            frontmatter {
              name
              color
              dark_text
              monochrome_logo {
                childImageSharp {
                  fixed(height: 24) {
                    ...GatsbyImageSharpFixed_withWebp_tracedSVG
                  }
                }
              }
            }
            fields {
              slug
            }
          }
        }
      }
    `
  ).allMarkdownRemark.nodes

  const party = allParties.find(search => {
    return search.name === partyName
  }).frontmatter

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
