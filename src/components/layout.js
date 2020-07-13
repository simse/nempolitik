import React from "react"
import PropTypes from "prop-types"

import Navbar from "./navbar"

const Layout = ({ children, width, theme }) => {
  if (!width) {
    width = 1400
  }

  return (
    <>
      <Navbar theme={theme} />
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
