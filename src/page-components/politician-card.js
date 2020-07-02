import React from "react"
import { Link } from "gatsby"
import Img from "gatsby-image"

import style from "../style/components/politician-card.module.scss"
import PartyTag from "../components/party-tag"
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

        <PartyTag party={politician.political_party} />
      </div>
    </Link>
  </div>
)

export default PoliticianCard
