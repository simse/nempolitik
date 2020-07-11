/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect } from "react"
import { Link } from "gatsby"
/*import moment from "moment"
import "moment/locale/da"*/
import "../style/components/plyr.scss"

import SEO from "../components/seo"
import Layout from "../components/layout"
import Footer from "../components/footer"

import { BsArrowLeftShort } from "react-icons/bs"
import style from "../style/pages/group-meeting.module.scss"

export default function PoliticalPartyPage({ pageContext }) {
  const meeting = pageContext.meeting

  const datetime = meeting.datetime

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const Plyr = require('plyr');
      Array.from(document.querySelectorAll('#player')).map(p => new Plyr(p/*, {
        previewThumbnails: { enabled: true, src: '/thumbnails/thumbnails.vtt' }
      }*/));
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

      <Footer />
    </Layout>
  )
}