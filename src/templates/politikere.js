import React from "react"
import { graphql, Link } from "gatsby"
import Equalizer from "react-equalizer"

import Footer from "../components/footer"
import Layout from "../components/layout"
import SEO from "../components/seo"
import PoliticianCard from "../page-components/politician-card"
import { BsArrowLeftShort, BsArrowRightShort } from "react-icons/bs"
import style from "../style/pages/politicians.module.scss"

const PoliticiansPage = ({data, pageContext}) => {
  let politicians = data.allPoliticians.nodes

  let currentPage = pageContext.currentPage + 1
  let politiciansPerPage = pageContext.perPage
  let pageCount = pageContext.numPages

  let startIndex = pageContext.skip
  let endIndex = currentPage * politiciansPerPage

  if (endIndex > pageContext.numPoliticians) {
    endIndex = pageContext.numPoliticians
  }

  let previousUrl = "/politikere"
  if (currentPage - 1 > 1) {
    previousUrl += "/side-" + (currentPage - 1)
  }
  let nextUrl = "/politikere/side-" + (currentPage + 1)

  let pages = []

  Array.from({ length: pageCount }).forEach((_, i) => {
    i = i+1

    if (i === 1) {
      pages.push("/politikere")
    } else {
      pages.push("/politikere/side-" + i)
    }
  });

  /*let shownPoliticians = politicians.filter((p, i) => {
    return i >= startIndex && i < endIndex
  })*/

  let shownPoliticians = politicians

  return(
    <Layout>
      <SEO title="Politikere" />
      <h1 style={{
        marginTop: 100
      }}>Politikere</h1>
      <p style={{
        marginBottom: 40
      }}>Alle politikere i Danmark.</p>

      <Equalizer byRow={true} className={style.row}>
        {shownPoliticians.map(value => (
          <PoliticianCard
            politician={value}
            key={value.id}
          />
        ))}
      </Equalizer>

      <p className={style.range}>Viser {startIndex+1}-{endIndex} ud af {pageContext.numPoliticians} politikere</p>

      <div className={style.pagination}>
        <div className={style.inner}>
          {currentPage !== 1 && 
          <div className={style.navButton}>
            <Link to={previousUrl}>
              <BsArrowLeftShort size={"2em"} style={{
                marginBottom: 2
              }} />
            </Link>
          </div>}
          

          {pages.map((url, index) => {
            let active = ""

            if (index + 1 === currentPage) {
              active = style.active
            }

            return (
              <div className={`${style.pageButton} ${active}`} key={url}>
                <Link to={url}>{index + 1}</Link>
              </div>
            )
          })}

          {currentPage !== pageCount &&
            <div className={style.navButton}>
            <Link to={nextUrl}>
              <BsArrowRightShort size={"2em"} style={{
                marginBottom: 2
              }} />
            </Link>
          </div>}
        </div>
      </div>

      <Footer />
    </Layout>
  )
}

export default PoliticiansPage


export const query = graphql`
query($limit: Int!, $skip: Int!) {
  allPoliticians: allPolitician(limit: $limit, skip: $skip) {
    nodes {
      id
      name
      slug
      photo {
        childImageSharp {
          fixed(width: 100, height: 100, cropFocus: NORTH, quality: 100) {
            ...GatsbyImageSharpFixed_withWebp
          }
        }
      }
      party {
        id
        name
        slug
        color
        dark_text
        monochrome_logo {
          childImageSharp {
            fixed(height: 24) {
              ...GatsbyImageSharpFixed_withWebp_tracedSVG
            }
          }
        }
      }
      memberships {
        from
        to
        political_entity {
          name
          id
          group_name
          type
        }
        political_entity_membership_type {
          id
          name
          importance
        }
      }
    }
  }
}
`