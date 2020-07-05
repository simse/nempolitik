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
          allPoliticalEntities: allMarkdownRemark(filter: {fileAbsolutePath: {regex: "/(political_entities)/"}}) {
            nodes {
              frontmatter {
                name
              }
            }
          }
          allPoliticalEntityMembershipTypes: allMarkdownRemark(filter: {fileAbsolutePath: {regex: "/(political_entity_membership_types)/"}}) {
            nodes {
              frontmatter {
                name
                importance
              }
            }
          }
          allPoliticalEntityMemberships: allMarkdownRemark(filter: {fileAbsolutePath: {regex: "/(political_entity_memberships)/"}}) {
            nodes {
              frontmatter {
                name
                importance
              }
            }
          }
        }
      `}
      render={data => (
        <div className={style.politicianCard}>
          <Link to={"/politiker/" + politician.fields.slug}>
            <div className={style.inner}>
              <Img
                fixed={politician.frontmatter.photo.childImageSharp.fixed}
                alt={"Billede af " + politician.name}
                style={{
                  margin: "0 auto 18px auto",
                  display: "block"
                }}
                imgStyle={{
                  borderRadius: "100px"
                }} />

              <h2>{ politician.frontmatter.name }</h2>
              <p className={style.role}>{ /*politicianRole(politician, politicalEntities)*/ }</p>

              <PartyTag partyId={politician.frontmatter.party} />
            </div>
          </Link>
        </div>
      )}
    />
)

export default PoliticianCard
