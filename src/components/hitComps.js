import React from "react"
import { Highlight } from "react-instantsearch-dom"
import { Link } from "gatsby"

import "../style/components/search.scss"

export const PoliticianHit = clickHandler => ({ hit }) => (
  <div className="politician-hit">
    <Link to={"/politiker/" + hit.slug} onClick={clickHandler}>
        <div className={"politician-inner"}>
            <div className={"politician-image"}>
                <img src={hit.photo} alt={"Billede af " + hit.name} />
            </div>
            <div className={"politician-meta"}>
                <h4>
                    <Highlight attribute="name" hit={hit} tagName="mark" />
                </h4>
                <span className={"politician-role"}><Highlight attribute="role" hit={hit} tagName="mark" /></span>
            </div>
        </div>
    </Link>
  </div>
)