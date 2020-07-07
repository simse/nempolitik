import { Link, graphql, useStaticQuery } from "gatsby"
import Img from "gatsby-image"
import React, { useState } from "react"

import { BsPersonFill, BsChatDotsFill, BsSearch, BsList } from "react-icons/bs"

import style from "../style/components/navbar.module.scss"

const Navbar = () => {
  const { logo_full } = useStaticQuery(graphql`
    query {
      logo_full: file(relativePath: {eq: "logo_full.png"}) {
        childImageSharp {
          fixed(height: 26, quality: 100) {
            ...GatsbyImageSharpFixed_withWebp_tracedSVG
          }
        }
      }
    }
  `)

  const [ navbarMenuClass, setNavbarMenuClass ] = useState(style.closed)

  const toggleMenu = () => {
    if (!navbarMenuClass) {
      setNavbarMenuClass(style.closed)
    } else {
      setNavbarMenuClass(null)
    }
  }

  const handleKeyPress = (key) => {
    if (key.keyCode === 13) {
      toggleMenu()
    }
  }

  return (
    <>
      <div className={`${style.overlay} ${navbarMenuClass}`}></div>

      <header className={style.navbar}>
        <div className={style.inner}>
          <div className={style.logo}>
            <div className={style.mobileButton}>
              <BsSearch size={"1.2em"} style={{marginBottom: 3, marginRight: 4}} /> Søg
            </div>

            <Link to="/">
              <Img className={style.wrapper} fixed={logo_full.childImageSharp.fixed} />
            </Link>

            <div className={style.mobileButton} onClick={toggleMenu} onKeyDown={handleKeyPress} role="menuitem" tabIndex={0}>
              Menu <BsList size={"1.3em"} style={{marginBottom: 1, marginLeft: 3}} />
            </div>
          </div>

          <div className={`${style.items} ${navbarMenuClass}`} style={{
            maxHeight: 145
          }}>
            <ul>
              <li>
                <Link to="/partier" tabIndex={0}><BsChatDotsFill size={"1.1em"} style={{marginBottom: 2, marginRight: 5}} /> Partier</Link>
              </li>
              <li>
                <Link to="/politikere" tabIndex={0}><BsPersonFill size={"1.3em"} style={{marginBottom: 2, marginRight: 4}} /> Politikere</Link>
              </li>
            </ul>
          </div>
        </div>
      </header>
    </>
  )
}

export default Navbar
