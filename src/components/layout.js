/* eslint-disable */
import React, { useState } from "react"
import PropTypes from "prop-types"
import {
  InstantSearch,
  Index,
  Hits,
  connectStateResults,
} from "react-instantsearch-dom"
import algoliasearch from "algoliasearch/lite"
import Input from "./input"
import * as hitComps from "./hitComps"

import Navbar from "./navbar"
import "../style/components/search.scss"

const Results = connectStateResults(
  ({ searchState: state, searchResults: res, children }) =>
    res && res.nbHits > 0 ? (
      children
    ) : (
      <span
        className={"no-results"}
      >{`Ingen resultater for '${state.query}'`}</span>
    )
)

const Layout = ({ children, width, theme }) => {
  if (!width) {
    width = 1400
  }

  const indices = [
    { name: `Politicians`, title: `Politicians`, hitComp: `PoliticianHit` }
  ]

  const [query, setQuery] = useState(``)
  const [open, setSearchOpen] = useState(false)
  const searchClient = algoliasearch(
    "QVZ9XEBSIY",
    "716a167289e2ab62bbe3abe41c37e3f2"
  )

  const handleOverlayClick = event => {
    if (event.target.className === "overlay") {
        setSearchOpen(false)
    }
  }

  const toggleSearch = () => {
    if (open) {
      setSearchOpen(false)
    } else {
      setSearchOpen(true)
    }
  }

  return (
    <>
      <InstantSearch
        searchClient={searchClient}
        indexName={indices[0].name}
        onSearchStateChange={({ query }) => setQuery(query)}
      >
        <div
          className={`overlay${!open ? " closed" : ""}`}
          onClick={event => handleOverlayClick(event)}
        >
          <div className={`search${!open ? " closed" : ""}`}>
            <Input />

            <div className={`results ${query.length > 0 && "shown"}`}>
              {indices.map(({ name, title, hitComp }) => (
                <Index key={name} indexName={name}>
                  {/*<header>
                              <h3>{title}</h3>
                              <Stats />
                          </header>*/}
                  <Results>
                    <Hits hitComponent={hitComps[hitComp]()} />
                  </Results>
                </Index>
              ))}
            </div>
          </div>
        </div>
      </InstantSearch>
      <Navbar theme={theme} toggleSearch={toggleSearch} />
      <div
        style={{
          margin: `0 auto`,
          maxWidth: width
        }}
      >
        <main>{children}</main>
      </div>
    </>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
