import React from "react"
import Img from "gatsby-image"

import style from "../style/components/party-tag.module.scss"

const PartyTag = ({ party }) => (
    
        <div
        className={`${style.partyTag} ${party.dark_text ? style.dark : ""}`}
        style={{
            background: party.color,
            color: party.text_color
        }}>
            <Img
                fixed={party.monochrome_logo.childImageSharp.fixed}
                alt={party.name + "'s logo"} />


            <span className={`${party.dark_text ? style.dark : ""}`}>{ party.name }</span>
        </div>

    
  )
  
  export default PartyTag