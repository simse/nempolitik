import React from "react"
import { Link, StaticQuery, graphql } from "gatsby"
import Img from "gatsby-image"

import style from "../style/components/politician-card.module.scss"
import PartyTag from "../components/party-tag"
import {politicianRole} from "../util"

const PoliticianCard = ({ politician }) => (
  <StaticQuery
      query={graphql`
        query {
          allPoliticalEntities: allMarkdown(filter: {type: {eq: "political_entity"}}) {
            nodes {
              name
              id
              entity_type
            }
          }
          allPoliticalEntityMembershipTypes: allMarkdown(filter: {type: {eq: "political_entity_membership_type"}}) {
            nodes {
              name
              importance
              political_entities
              id
            }
          }
          allPoliticalEntityMemberships: allMarkdown(filter: {type: {eq: "political_membership"}}) {
            nodes {
              from
              to
              political_entity
              political_entity_membership_type
              politician
            }
          }
        }
      `}
      render={data => (
        <div className={style.politicianCard}>
          <Link to={"/politiker/" + politician.slug}>
            <div className={style.inner}>
              <Img
                fixed={politician.photo.childImageSharp.fixed}
                alt={"Billede af " + politician.name}
                style={{
                  margin: "0 auto 18px auto",
                  display: "block"
                }}
                imgStyle={{
                  borderRadius: "100px"
                }} />

              <h2>{ politician.name }</h2>
              <p className={style.role}>{ politicianRole(politician, data.allPoliticalEntities.nodes, data.allPoliticalEntityMemberships.nodes, data.allPoliticalEntityMembershipTypes.nodes) }</p>

              <PartyTag partyId={politician.party} />
            </div>
          </Link>
        </div>
      )}
    />
)

export default PoliticianCard
