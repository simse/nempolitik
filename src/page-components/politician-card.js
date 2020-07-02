import React from "react"
import { Link } from "gatsby"
import Img from "gatsby-image"

import style from "../style/components/politician-card.module.scss"
import {politicianName, politicianRole} from "../util"

const PoliticianCard = ({ politician, politicalEntities }) => (
  <div className={style.politicianCard}>
    <Link to={"/politiker/" + politician.slug}>
      <div className={style.inner}>
        <Img
          fixed={politician.photo.childImageSharp.fixed}
          alt={"Billede af " + politicianName(politician)}
          style={{
            margin: "0 auto 18px auto",
            display: "block"
          }}
          imgStyle={{
            borderRadius: "100px"
          }} />

        <h2>{ politicianName(politician) }</h2>
        <p className={style.role}>{ politicianRole(politician, politicalEntities) }</p>

        <div
          className={`${style.partyTag} ${politician.political_party.dark_text ? style.dark : ""}`}
          style={{
            background: politician.political_party.color,
            color: politician.political_party.text_color
          }}>
          <Img
            fixed={politician.political_party.logo.childImageSharp.fixed}
            alt={politician.political_party.name + "'s logo"} />


          <span className={`${politician.political_party.dark_text ? style.dark : ""}`}>{ politician.political_party.name }</span>
        </div>
      </div>
    </Link>
  </div>
)

export default PoliticianCard
