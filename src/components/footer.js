import React from "react"
import { Link, useStaticQuery, graphql } from "gatsby"

import style from "../style/components/footer.module.scss"

const Footer = () => {
  const data = useStaticQuery(graphql`
    query {
      regions: allPoliticalEntity(filter: {type: {eq: "region"}}) {
        nodes {
          id
          name
          urlPrefix
          slug
        }
      }
      municipalities: allPoliticalEntity(limit: 5, filter: {type: {eq: "municipality"}}) {
        nodes {
          id
          name
          urlPrefix
          slug
        }
      }
      politicians: allPolitician(limit: 5) {
        nodes {
          id
          name
          slug
        }
      }
      parties: allPoliticalParty(limit: 5) {
        nodes {
          id
          slug
          name
        }
      },
      currentBuildDate {
        currentDate
      }
    }
  `)

  const currentTime = data.currentBuildDate.currentDate

  return (
    <div className={style.footer}>
      <div className={style.inner}>
        <div>
          <h2>Politikere</h2>

          <ul>
            {data.politicians.nodes.map(politician => {
              let url = "/politiker/" + politician.slug

              return (
                <li key={politician.id}>
                  <Link to={url}>{politician.name}</Link>
                </li>
              )
            })}

            <li>
              <Link to={"/politikere"}>Se alle...</Link>
            </li>
          </ul>
        </div>

        <div>
          <h2>Partier</h2>

          <ul>
            {data.parties.nodes.map(party => {
              let url = "/parti/" + party.slug

              return (
                <li key={party.id}>
                  <Link to={url}>{party.name}</Link>
                </li>
              )
            })}

            <li>
              <Link to={"/partier"}>Se alle...</Link>
            </li>
          </ul>
        </div>

        <div>
          <h2>Kommuner</h2>

          <ul>
            {data.municipalities.nodes.map(municipality => {
              let url = "/" + municipality.urlPrefix + municipality.slug

              return (
                <li key={municipality.id}>
                  <Link to={url}>{municipality.name}</Link>
                </li>
              )
            })}
          </ul>
        </div>

        <div>
          <h2>Regioner</h2>

          <ul>
            {data.regions.nodes.map(region => {
              let url = "/" + region.urlPrefix + region.slug

              return (
                <li key={region.id}>
                  <Link to={url}>{region.name}</Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <p>Sidst opdateret: {currentTime}</p>
    </div>
  )
}

export default Footer
