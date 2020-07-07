import React from "react"
import { Link, useStaticQuery, graphql } from "gatsby"
import Img from "gatsby-image"

import style from "../style/components/politician-card.module.scss"
import PartyTag from "../components/party-tag"
import PoliticianRole from "../page-components/politician-role"

const PoliticianCard = ({ politicianId, entityGroupFilter }) => {
  const { allPoliticians } = useStaticQuery(
    graphql`
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
  )

  const politician = allPoliticians.nodes.find(p => {
    return p.id === politicianId
  })

  return (
    <div className={style.politicianCard}>
      <Link to={"/politiker/" + politician.slug}>
        <div className={style.inner}>
          <Img
            fixed={politician.photo.childImageSharp.fixed}
            alt={"Billede af " + politician.name}
            style={{
              margin: "0 auto 18px auto",
              display: "block",
            }}
            imgStyle={{
              borderRadius: "100px",
            }}
          />

          <h2>{politician.name}</h2>
          <p className={style.role}>
            <PoliticianRole politicianId={politician.id} entityGroupFilter={entityGroupFilter} />
          </p>

          <PartyTag partyId={politician.party} />
        </div>
      </Link>
    </div>
  )
}

export default PoliticianCard
