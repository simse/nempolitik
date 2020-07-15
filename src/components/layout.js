/* eslint-disable */
import React, { useState } from "react"
import PropTypes from "prop-types"
import {
  InstantSearch,
  Index,
  Hits,
  connectStateResults,
  SearchBox
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
    { name: `Everything`, title: `Everything`, hitComp: `Hit` }
  ]

  const [query, setQuery] = useState(``)
  const [open, setSearchOpen] = useState(false)
  const searchClient = algoliasearch(
    process.env.GATSBY_ALGOLIA_APP_ID,
    process.env.GATSBY_ALGOLIA_APP_SEARCH_KEY
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
      if (searchBox) {
        searchBox.focus()
      } 
    }
  }

  const handleSearchBoxKey = (key) => {
      if (key.keyCode === 27) {
      toggleSearch()
    }
  }

  const [searchBox, setSearchBox] = useState(null)


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
            <SearchBox 
              inputRef={input => {setSearchBox(input)}}
              submit={<></>}
              reset={<></>}
              onKeyDown={handleSearchBoxKey}
              tabindex="0"
              translations={{
                placeholder: 'Søg her...',
              }}/>

            <div className={`results ${query.length > 0 && "shown"}`}>
              {indices.map(({ name, hitComp }) => (
                <Index key={name} indexName={name}>
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
