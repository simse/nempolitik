/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect } from "react"
import { Link } from "gatsby"
import moment from "moment"
import "moment/locale/da"
import "../style/components/plyr.scss"

import SEO from "../components/seo"
import Layout from "../components/layout"

import { BsArrowLeftShort } from "react-icons/bs"
import style from "../style/pages/group-meeting.module.scss"

export default function PoliticalPartyPage({ pageContext }) {
  const meeting = pageContext.meeting

  moment.locale("da")
  const datetime = moment(meeting.datetime).format("LLLL")

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const Plyr = require('plyr');
      Array.from(document.querySelectorAll('#player')).map(p => new Plyr(p));
    }
  })

  return (
    <Layout width={3000}>
      <SEO title={meeting.name} />

      <div className={style.videoContainer}>
        <div style={{
          marginBottom: 20
        }}>
          <Link to={pageContext.groupUrl}><BsArrowLeftShort size="1.4em" style={{
            marginBottom: 3
          }} /> Tilbage til {pageContext.groupName}</Link>
        </div>

        
        <video id="player" playsinline controls>
          <source src={meeting.video_url} type="video/mp4" />
        </video>
        

        <h1>{meeting.name}</h1>
        <span>{datetime}</span>
      </div>
    </Layout>
  )
}