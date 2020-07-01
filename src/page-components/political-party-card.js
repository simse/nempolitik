import React from "react"
import { Link } from "gatsby"
import Img from "gatsby-image"

import style from "../style/components/political-party-card.module.scss"


// Functions
const politicalLeaningToTag = leaning => {
  const leaningDefinition = [
    {
      lowerLimit: -100,
      upperLimit: -80,
      explanation: "Ultra-venstre",
      color: "rgb(205, 20, 49)",
      textColor: "#fff"
    },
    {
      lowerLimit: -81,
      upperLimit: -50,
      explanation: "Venstre",
      color: "rgb(205, 20, 49)",
      textColor: "#fff"
    },
    {
      lowerLimit: -51,
      upperLimit: -2,
      explanation: "Venstre/centrum",
      color: "rgb(205, 20, 49)",
      textColor: "#fff"
    },
    {
      lowerLimit: -1,
      upperLimit: 1,
      explanation: "Centrum",
      color: "rgb(205, 20, 49)",
      textColor: "#fff"
    },
    {
      lowerLimit: 2,
      upperLimit: 20,
      explanation: "Højre/centrum",
      color: "rgb(0, 53, 95)",
      textColor: "#fff"
    },
    {
      lowerLimit: 21,
      upperLimit: 60,
      explanation: "Højre",
      color: "rgb(0, 53, 95)",
      textColor: "#fff"
    },
    {
      lowerLimit: 61,
      upperLimit: 100,
      explanation: "Ultra-højre",
      color: "rgb(0, 53, 95)",
      textColor: "#fff"
    },
  ];

  let leaningDescription;

  leaningDefinition.forEach(value => {
    if (leaning >= value.lowerLimit && leaning <= value.upperLimit) {
      leaningDescription = value;
    }
  });

  return (
    <div className={style.fact} style={{
      background: leaningDescription.color,
      color: leaningDescription.textColor
    }}>
      { leaningDescription.explanation }
    </div>
  )
};


const PoliticalPartyCard = ({ politicalParty }) => (
  <div className={style.politicalPartyCard} style={{
    borderColor: politicalParty.color
  }}>
    <Link to={"/parti/" + politicalParty.slug}>
      <div className={style.logo}>
        <Img
          fixed={ politicalParty.logo.childImageSharp.fixed }
          alt={ politicalParty.name + "'s logo" }/>
      </div>

      <h2>{ politicalParty.name } ({ politicalParty.symbol })</h2>

      <div className={style.facts}>
        { politicalLeaningToTag(politicalParty.political_leaning) }
      </div>
    </Link>
  </div>
)

export default PoliticalPartyCard
