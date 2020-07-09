import React, { useState, useLayoutEffect, useEffect } from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"
import { uniqBy } from "lodash"

import Equalizer from "react-equalizer"
import PoliticianCard from "../page-components/politician-card"
import SEO from "../components/seo"
import Layout from "../components/layout"

import { BsChevronRight, BsChevronLeft, BsGeoAlt } from "react-icons/bs"
import style from "../style/pages/municipality.module.scss"


function useWindowSize() {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
}

export default function MunicipalityPage({ data }) {
  const entity = data.politicalEntity
  let members = uniqBy(data.members.nodes, "id")

  // Create slider offset state
  const [sliderOffset, setSliderOffset] = useState(0)
  const [shownCardCount, setShownCardCount] = useState(1)
  const [width] = useWindowSize()

  useEffect(() => {
    if (width < 580) {
      setShownCardCount(members.length)
      setSliderOffset(0)
    } else if (width < 790) {
      setShownCardCount(1)
    } else if(width < 980) {
      setShownCardCount(2)
    } else if (width < 1240) {
      setShownCardCount(3)
    } else {
      setShownCardCount(4)
    }
  }, [width, members.length])

  const politicianCard = (politician, index) => {
    let beginIndex = sliderOffset * shownCardCount
    let endIndex = beginIndex + (shownCardCount - 1)
    let hidden = false

    if (index >= beginIndex && index <= endIndex) {
      hidden = false
    } else {
      hidden = true
    }


    return (
      <PoliticianCard
        politician={politician}
        key={politician.id}
        hidden={hidden}
      />
    )
  }

  let maxOffset = Math.floor(members.length / shownCardCount)

  const NextSlideButton = () => {
    if (sliderOffset + 1 <= maxOffset) {
      return (
        <button onClick={nextSliderPage} aria-label="Naviger frem"><BsChevronRight size="2.6em" /></button>
      )
    }

    return <></>
  }

  const PreviousSlideButton = () => {
    if (sliderOffset > 0) {
      return (
        <button onClick={previousSliderPage} aria-label="Naviger tilbage"><BsChevronLeft size="2.6em" /></button>
      )
    }

    return <></>
  }


  const nextSliderPage = () => {
    if (sliderOffset < maxOffset) {
      setSliderOffset(sliderOffset + 1)
    }
  }

  const previousSliderPage = () => {
    if (sliderOffset > 0) {
      setSliderOffset(sliderOffset - 1)
    }
  }

  return (
    <Layout width={2000}>
      <SEO title={ entity.name } />
      <div className={style.municipality}>
        <div className={style.header}>
          <div className={style.meta}>

            <h1>{ entity.name }</h1>


            <div className={style.tags}>
              <span><BsGeoAlt /> Østfyn</span>
            </div>

            <p>{ entity.subtitle }</p>
            
          </div>

          <Img className={style.banner} fluid={entity.banner.childImageSharp.fluid} style={{
            maxHeight: "90vh"
          }} />
        </div>

        <div className={style.content}>
          <h2 className={style.sectionTitle}>Byrådet</h2>

          <div className={style.slider}>
            <div className={style.navButton}>
              <PreviousSlideButton />
            </div>

            <Equalizer className={style.row} style={{
              transform: `translateX(-${sliderOffset * 102}%)`
            }}>
              {members.map((value, index) => politicianCard(value, index))}
            </Equalizer>

            <div className={style.navButton}>
              <NextSlideButton />
            </div>
          </div>
        </div>
      </div>

    </Layout>
  )
}

export const query = graphql`
  query($id: String!) {
    politicalEntity(id: {eq: $id}) {
      name
      subtitle
      group_name
      logo {
        childImageSharp {
          fixed(height: 140, quality: 100) {
            ...GatsbyImageSharpFixed_withWebp
          }
        }
      }
      banner {
        childImageSharp {
          fluid(maxWidth: 2000, maxHeight: 1500, quality: 100) {
            ...GatsbyImageSharpFluid_withWebp
          }
        }
      }
    }
    members: allPolitician(filter: {memberships: {elemMatch: {political_entity: {id: {eq: $id}}}}}) {
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