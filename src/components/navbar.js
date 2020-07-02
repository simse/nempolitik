import { Link } from "gatsby"
import PropTypes from "prop-types"
import React from "react"

import style from "../style/components/navbar.module.scss"

const Navbar = ({ siteTitle }) => (
  <header className={style.navbar}>
    <div className={style.inner}>
      <div className={style.logo}>
        <Link to="/">
          <h1>nempolitik.dk</h1>
        </Link>
      </div>

      <div className={style.items}>
        <ul>
          <li>
            <Link to="/partier">Partier</Link>
          </li>
          <li>
            <Link to="/politikere">Politikere</Link>
          </li>
        </ul>
      </div>
    </div>
  </header>
)

Navbar.propTypes = {
  siteTitle: PropTypes.string,
}

Navbar.defaultProps = {
  siteTitle: ``,
}

export default Navbar
