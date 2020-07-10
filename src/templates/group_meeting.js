import React from "react"
import { Link } from "gatsby"
import ReactPlayer from 'react-player'
import moment from "moment"
import "moment/locale/da"

import SEO from "../components/seo"
import Layout from "../components/layout"

import { BsArrowLeftShort } from "react-icons/bs"
import style from "../style/pages/group-meeting.module.scss"

export default function PoliticalPartyPage({ pageContext }) {
  const meeting = pageContext.meeting

  moment.locale("da")
  const datetime = moment(meeting.datetime).format("LLLL")

  return (
    <Layout width={3000}>
      <SEO title={meeting.name} />

      <div className={style.videoContainer}>
        <Link to={pageContext.groupUrl}><BsArrowLeftShort size="1.4em" style={{
          marginBottom: 3
        }} /> Tilbage til {pageContext.groupName}</Link>

        <ReactPlayer url={meeting.video_url} controls={true} width="100%" height="100%"/>

        <h1>{meeting.name}</h1>
        <span>{datetime}</span>
      </div>
    </Layout>
  )
}