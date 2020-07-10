import React from "react"
import { Link } from "gatsby"
import Img from "gatsby-image"
import moment from "moment"
import "moment/locale/da"

import style from "../style/components/meeting.module.scss"

const MeetingVideo = ({ meeting, url }) => {
  moment.locale("da")
  const date = moment(meeting.datetime)

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
        <span className={style.datetime}>{date.format("LLLL")}</span> 
      </div>
    </Link>
  )
}

export default MeetingVideo
