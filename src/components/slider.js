import React, { useState, useLayoutEffect, useEffect } from "react"
import Equalizer from "react-equalizer"

import { BsChevronRight, BsChevronLeft } from "react-icons/bs"
import style from "../style/components/slider.module.scss"

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

const Slider = ({ cards }) => {
  const [sliderOffset, setSliderOffset] = useState(0)
  const [shownCardCount, setShownCardCount] = useState(1)
  const [width] = useWindowSize()

  useEffect(() => {
    if (width < 580) {
      setShownCardCount(cards.length)
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
  }, [width, cards.length])

  const createCard = (card, index) => {
    let beginIndex = sliderOffset * shownCardCount
    let endIndex = beginIndex + (shownCardCount - 1)
    let className

    if (index >= beginIndex && index <= endIndex) {
      className = null
    } else {
      className = style.noShadow
    }

    return (
      <div className={className} key={index}>
        {card}
      </div>
    )
  }

  let maxOffset = Math.ceil(cards.length / shownCardCount)

  const NextSlideButton = () => {
    if (sliderOffset + 1 < maxOffset) {
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
      <div className={style.slider}>
        <div className={style.navButton}>
          <PreviousSlideButton />
        </div>

        <Equalizer className={style.row} style={{
          transform: `translateX(-${sliderOffset * 102}%)`
        }}>
          {cards.map((value, index) => createCard(value, index))}
        </Equalizer>

        <div className={style.navButton}>
          <NextSlideButton />
        </div>
      </div>
  )
}

export default Slider
