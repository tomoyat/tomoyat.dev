import React from "react"
import { Link } from "gatsby"
import * as cardStyles from './card.module.css'

export default function Card(props) {
  return (
    <div className={cardStyles.card}>
      <p className={cardStyles.date}>{props.date}</p>
      <Link to={props.slug}>
        <h3>{props.title}</h3>
      </Link>
    </div>
  )
}
