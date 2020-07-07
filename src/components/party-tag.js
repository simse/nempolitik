import React from "react"
import Img from "gatsby-image"

import style from "../style/components/party-tag.module.scss"

const PartyTag = ({ party }) => {
  return (
    <div
      className={`${style.partyTag} ${party.dark_text ? style.dark : ""}`}
      style={{
        background: party.color
      }}
    >
      <div
      style={{
        minWidth: 24,
        height: 24
      }}>
        <Img
          fixed={party.monochrome_logo.childImageSharp.fixed}
          alt={party.name + "'s logo"}
        />
      </div>
      

      <span className={`${party.dark_text ? style.dark : ""}`}>
        {party.name}
      </span>
    </div>
  )
}

export default PartyTag
