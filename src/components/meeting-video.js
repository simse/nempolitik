import React, { useState } from "react"
import Img from "gatsby-image"
import moment from "moment"
import "moment/locale/da"
import ReactPlayer from 'react-player'
import { BsX } from "react-icons/bs"

import style from "../style/components/meeting.module.scss"

const MeetingVideo = ({ meeting }) => {
  moment.locale("da")
  let date = moment(meeting.datetime)

  const [modalOpenClass, setModalOpenClass] = useState(style.closed)

  const toggleModal = () => {
    if (modalOpenClass === style.closed) {
      setModalOpenClass(null)
    } else {
      setModalOpenClass(style.closed)
    }
  }


  return (
    <>
    <div className={`${style.playerModal} ${modalOpenClass}`}>
      <div className={style.modalInner}>
        <BsX className={style.closeButton} size={"3em"} onClick={toggleModal} />

        <ReactPlayer url={meeting.video_url} controls={true} />

        <div className={style.meta}>
          <h3>{meeting.name}</h3>
          <span>{date.format("LLL")}</span>
        </div>
      </div>
    </div>

    <div className={style.meeting} onClick={toggleModal}>
      <Img fluid={meeting.thumbnail.childImageSharp.fluid} className={style.image} style={{
        marginBottom: 20,
        borderRadius: 4
      }} />
      <h3>{meeting.name}</h3>
      <span className={style.datetime}>{date.format("LLL")}</span> 
    </div>
  </>
  )
}

export default MeetingVideo
