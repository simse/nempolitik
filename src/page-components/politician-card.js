import React from "react"
import { Link } from "gatsby"
import Img from "gatsby-image"

import PartyTag from "../components/party-tag"
import PoliticianRole from "../page-components/politician-role"
import style from "../style/components/politician-card.module.scss"

const PoliticianCard = ({ politician, entityGroupFilter, hidden }) => {
  let hiddenClass = hidden ? style.hidden : ""

  return (
    <div className={`${style.politicianCard} ${hiddenClass}`}>
      <Link to={"/politiker/" + politician.slug}>
        <div className={style.inner}>
          <Img
            fixed={politician.photo.childCloudinaryAsset.fixed}
            alt={"Billede af " + politician.name}
            style={{
              margin: "0 auto 18px auto",
              display: "block",
              maxHeight: 100
            }}
            imgStyle={{
              borderRadius: "100px",
            }}
          />

          <h2>{politician.name}</h2>
          <p className={style.role}>
            <PoliticianRole politician={politician} entityGroupFilter={entityGroupFilter} />
          </p>

          <PartyTag party={politician.party} />
        </div>
      </Link>
    </div>
  )
}

export default PoliticianCard
