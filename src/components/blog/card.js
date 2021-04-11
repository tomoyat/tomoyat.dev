import React from "react"
import { Link } from "gatsby"

export default function Card(props) {
  return (
    <div>
      <Link to={props.slug}>
        <h3>{props.title}</h3>
      </Link>
      <p>{props.date}</p>
      <p>{props.excerpt}</p>
    </div>
  )
}
