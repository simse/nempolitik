import React from "react"
import { connectSearchBox } from "react-instantsearch-dom"

import "../style/components/search.scss"

export default connectSearchBox(({ refine, ...rest }) => (
  <div>
    <input
      className="search-box"
      type="text"
      placeholder="Søg"
      aria-label="Søg"
      spellCheck="false"
      autoComplete="false"
      onChange={e => refine(e.target.value)}
      {...rest}
    />
  </div>
))