import React from "react"
import { Highlight } from "react-instantsearch-dom"
import { Link } from "gatsby"
import Img from "gatsby-image"

import "../style/components/search.scss"

export const Hit = clickHandler => ({ hit }) => {
    if (hit.type === "politician") {
        return (
            <div className="politician-hit">
                <Link to={hit.url} onClick={clickHandler}>
                    <div className={"politician-inner"}>
                        <div className={"politician-image"}>
                            <Img fixed={hit.photo} />
                        </div>
                        <div className={"politician-meta"}>
                            <h4>
                                <Highlight attribute="name" hit={hit} tagName="mark" />
                            </h4>
                            <span className={"politician-role"}>
                                <Highlight attribute="role" hit={hit} tagName="mark" />
                            </span>
                        </div>
                    </div>
                </Link>
            </div>
        )
    } else if(hit.type === "region" || hit.type === "municipality") {
        return (
            <div className="entity-hit">
                <Link to={hit.url} onClick={clickHandler}>
                    <h4>
                        <Highlight attribute="name" hit={hit} tagName="mark" />
                    </h4>
                </Link>
            </div>
        )
    } else if(hit.type === "party") {
        return (
            <div className="party-hit">
                <Link to={hit.url} onClick={clickHandler}>
                    <div className={"party-inner"}>
                        <div className={"party-image"} style={{
                            background: hit.color
                        }}>
                            <Img fixed={hit.logo} />
                        </div>
                        <div className={"party-meta"}>
                            <h4>
                                <Highlight attribute="name" hit={hit} tagName="mark" />
                            </h4>
                            <span className={"politician-role"}>
                                Parti
                            </span>
                        </div>
                    </div>
                </Link>
            </div>
        )
    } else if(hit.type === "group") {
        return (
            <div className="group-hit">
                <Link to={hit.url} onClick={clickHandler}>
                    <h4>
                        <Highlight attribute="name" hit={hit} tagName="mark" />
                    </h4>
                    <span className={"politician-role"}>
                        <Highlight attribute="entity" hit={hit} tagName="mark" />
                    </span>
                </Link>
            </div>
        )
    } else {
        return <>hello world</>
    }
}