import React from "react"
import { connectSearchBox } from "react-instantsearch-dom"

import "../style/components/search.scss"

/*export default connectSearchBox(({ refine, ref, ...rest }) => (
  
))*/



export default connectSearchBox(React.forwardRef((props, ref) => {
  return (
    <input
      className="search-box"
      type="text"
      placeholder="Søg"
      aria-label="Søg"
      spellCheck="false"
      autoComplete="false"
      onChange={e => props.refine(e.target.value)}
      ref={ref}
    />
  )
}))