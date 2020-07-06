import { Link } from "gatsby"
import PropTypes from "prop-types"
import React from "react"

import { BsPersonFill, BsFillShieldFill } from "react-icons/bs"

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
            <Link to="/partier"><BsFillShieldFill size={"1.1em"} style={{marginBottom: 2, marginRight: 5}} /> Partier</Link>
          </li>
          <li>
            <Link to="/politikere"><BsPersonFill size={"1.3em"} style={{marginBottom: 2, marginRight: 4}} /> Politikere</Link>
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
