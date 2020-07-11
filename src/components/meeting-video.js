import React from "react"
import { Link } from "gatsby"
import Img from "gatsby-image"

import style from "../style/components/meeting.module.scss"

const MeetingVideo = ({ meeting, url }) => {
  return (
    <Link to={url} style={{
      color: "inherit",
      textDecoration: "none"
    }}>
      <div className={style.meeting}>
        <Img fluid={meeting.thumbnail.childImageSharp.fluid} className={style.image} style={{
          marginBottom: 20,
          borderRadius: 4
        }} />
        <h3>{meeting.name}</h3>
        <span className={style.datetime}>{meeting.datetime}</span> 
      </div>
    </Link>
  )
}

export default MeetingVideo
